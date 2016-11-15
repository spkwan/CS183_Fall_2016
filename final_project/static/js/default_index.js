// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    function get_post_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return get_posts_url + "?" + $.param(pp);
    }


    self.get_posts = function () {
        $.getJSON(get_post_url(0,4), function (data) {
            self.vue.posts = data.posts;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
        })
    };


    self.get_more = function (){
        var num_posts = self.vue.posts.length;
        $.getJSON(get_post_url(num_posts, num_posts + 4), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
        });

    };

    // ADD post
    self.add_post_button = function () {
        if(self.vue.logged_in)
            self.vue.is_adding_post = !self.vue.is_adding_post;
        self.vue.form_content = "";
    };


    self.add_post = function () {
      $.post(add_post_url,{
          post_content: self.vue.form_content
      }, function (data){
          $.web2py.enableElement($("#add_post_submit"));
          self.vue.posts.unshift(data.post);
          self.get_posts();
      });
      self.vue.form_content = "";
      self.vue.is_adding_post = !self.vue.is_adding_post;
    };

    //EDIT post
    self.edit_post = function() {
        $.post(edit_post_url,{
            post_id: self.vue.edit_post_id,
            post_content: self.vue.form_edit_content
        }, function (data){
            $.web2py.enableElement($("#edit_post_submit"));
            self.vue.posts.unshift(data.post);
            self.get_posts();
        });
        //reset edit
        self.vue.edit_post_id = null;
    };

    //UPDATE post
    self.update_post = function(post_id, post_content) {
        self.vue.edit_post_id = post_id;
        self.vue.form_edit_content = post_content;
    };

    //DELETE post
    self.delete_post = function(post_id) {
        $.post(del_post_url,{
            post_id: post_id
        }, function () {
            var idx = null;
            for (var i = 0; i < self.vue.posts.length; i++){
                if (self.vue.posts[i].id === post_id) {
                    idx = i + 1;
                    break;
                }
            }
            if (idx) {
                self.vue.posts.splice(idx - 1, 1);
            }
            //refresh
            self.get_posts();
        })
    };

    //REPLY post
    self.reply_post_button = function (post_id) {
        self.vue.is_replying_post = !self.vue.is_replying_post;
        self.vue.reply_post_id = post_id;
        self.vue.form_reply_content = "";
    };

    self.reply_post = function() {
        $.post(reply_post_url,{
            reply_content: self.vue.form_reply_content,
            reply_post_id: self.vue.reply_post_id
        },
        function (data){
            $.web2py.enableElement($("#reply_post_submit"));
            //self.vue.posts.unshift(data.post);
            self.get_posts();
        });
        self.vue.is_replying_post = !self.vue.is_replying_post;
    }

    //Expand replies for a post
    self.expand_reply_button = function (post_id) {
        self.vue.is_expanded = !self.vue.is_expanded;
    };

    //vue for image slider
    self.img = new Vue({
        el: '#slider',
        data: {
            images: ['https://upload.wikimedia.org/wikipedia/commons/4/4e/Computer_keyboard.png', 'http://www.cbc.ca/books/library-books-584.jpg', 'https://t3.ftcdn.net/jpg/00/97/17/62/240_F_97176232_PHOEZ1lMpWwMl7Du8HY4Zt7yuJMxAUsP.jpg', 'http://blog.thembatour.com/hs-fs/hubfs/hand_studying.jpg?t=1472670613746&width=568&height=349&name=hand_studying.jpg'],
            currentNumber: 0,
            timer: null,
            show: false
        },

        ready: function () {
            this.startRotation();
        },

        methods: {
            startRotation: function() {
                this.timer = setInterval(this.next, 3000);
            },
            stopRotation: function() {
                clearTimeout(this.timer);
                this.timer = null;
            },
            next: function() {
                this.currentNumber += 1
            },
            prev: function() {
                this.currentNumber -= 1
            }
        }
    });

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_adding_post: false,
            is_replying_post: false,
            is_expanded: true,
            edit_post_id: null,
            reply_post_id: null,
            posts: [],
            logged_in: false,
            has_more: false,
            form_content: null,
            form_edit_content: null,
            form_reply_content: null
        },
        methods: {
            get_more: self.get_more,
            add_post_button: self.add_post_button,
            add_post: self.add_post,
            delete_post: self.delete_post,
            edit_post: self.edit_post,
            update_post: self.update_post,
            reply_post_button: self.reply_post_button,
            reply_post: self.reply_post,
            expand_reply_button: self.expand_reply_button
        }

    });

    self.get_posts();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
