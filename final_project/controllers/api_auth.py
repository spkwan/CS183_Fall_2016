def index():
    pass

def get_user_name_from_email(email):
    """Returns a string corresponding to the user first and last names,
    given the user email."""
    u = db(db.auth_user.email == email).select().first()
    if u is None:
        return 'None'
    else:
        return ' '.join([u.first_name, u.last_name])

def get_posts():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    posts = []
    has_more = False
    rows = db().select(db.post.ALL, limitby=(start_idx, end_idx + 1), orderby=db.post.user_email)
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            # If the user is the original poster of the post
            if auth.user is not None:
                if auth.user.email == r.user_email:
                    op = True
                else:
                    op = False
            else:
                op = False

            p = dict(
                id = r.id,
                user_email = get_user_name_from_email(r.user_email),
                post_content = r.post_content,
                post_title = r.post_title,
                created_on = r.created_on,
                updated_on = r.updated_on,
                op = op
            )

            reply = db(db.reply.post_id == r.id).select()
            if reply:
                reply_list = []
                for item in reply:
                    n = dict(
                        id=item.id,
                        user_email=item.user_email,
                        post_content=item.post_content,
                        created_on=item.created_on,
                        updated_on=item.updated_on
                    )
                    reply_list.append(n)
                    print reply_list
                p.update({'replies': reply_list})

            posts.append(p)
        else:
            has_more = True
    logged_in = auth.user_id is not None
    return response.json(dict(posts=posts, logged_in=logged_in, has_more=has_more))

# Note that we need the URL to be signed, as this changes the db.
@auth.requires_signature()
def add_post():
    p_id = db.post.insert(
        post_title = request.vars.post_title,
        post_content = request.vars.post_content
    )
    p = db.post(p_id)
    return response.json(dict(post=p))

@auth.requires_signature()
def del_post():
    db(db.post.id == request.vars.post_id).delete()
    return "ok"

@auth.requires_signature()
def edit_post():
    p = db(db.post.id == request.vars.post_id).select().first()
    # Only modify database if edited post is different.
    if p.post_content != request.vars.post_content:
        p.post_content = request.vars.post_content
        p.updated_on = datetime.datetime.utcnow()
        p.update_record()
    else:
        pass
    return response.json(dict(post=p))

@auth.requires_signature()
def reply_post():
    r = db.reply.insert(
        post_content=request.vars.reply_content,
        post_id = request.vars.reply_post_id
    )
    return response.json(dict(reply=r))