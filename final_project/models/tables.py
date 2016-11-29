# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

# def get_user_email():
#     return auth.user.email if auth.user else None

def get_user_email():
    """Note that this function always returns a lowercase email address."""
    if request.env.web2py_runtime_gae:
        from google.appengine.api import users as googleusers
        u = googleusers.get_current_user()
        if u is None:
            return None
        else:
            return u.email().lower()
    else:
        if auth.user is None:
            return None
        else:
            return auth.user.email.lower()

db.define_table('post',
                Field('user_email', default=auth.user.email if auth.user_id else None),
                Field('post_title', 'text'),
                Field('post_content', 'text'),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                )

db.define_table('reply',
                Field('user_email', default=auth.user.email if auth.user_id else None),
                Field('post_content', 'text'),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('post_id', 'reference post')
                )

# I don't want to display the user email by default in all forms.
db.post.user_email.readable = db.post.user_email.writable = False
db.post.post_title.requires = IS_NOT_EMPTY()
db.post.post_content.requires = IS_NOT_EMPTY()
db.post.created_on.readable = db.post.created_on.writable = False
db.post.updated_on.readable = db.post.updated_on.writable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
