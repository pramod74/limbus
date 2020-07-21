import requests

from flask import redirect, abort, render_template, url_for, session, flash
from flask_login import logout_user, current_user

from ..auth.models import UserAccount
from ..misc.models import SiteInformation, Address

from ..auth.forms import UserAccountRegistrationForm

from . import setup
from .. import db
from .forms import SiteRegistrationForm

from ..decorators import as_kryten, setup_mode

from ..generators import generate_random_hash


@setup.route("/")
@as_kryten
@setup_mode
def index():
    return render_template("setup/index.html")

@setup.route("/eula")
@setup_mode
def eula():
    return render_template("setup/eula.html")

@setup.route("/site_registration", methods=["GET", "POST"])
@setup_mode
def site_registration():

    form = SiteRegistrationForm()

    if form.validate_on_submit():

        hash = generate_random_hash()

        site = {
            "name": form.name.data,
            "url": form.url.data,
            "description": form.description.data,
            "address" : {
                "street_address_one": form.address_line_one.data,
                "street_address_two": form.address_line_two.data,
                "city": form.city.data,
                "country":  form.country.data,
                "post_code": form.post_code.data,
            }
        }


        session[hash] = {
            "site": site
        }


        return redirect(url_for("setup.admin_registration", hash=hash))

    return render_template("setup/site_registration.html", form=form)



@setup.route("/administrator_registration/<hash>", methods=["GET", "POST"])
@as_kryten
@setup_mode
def admin_registration(hash: str):
    # Step Three: Ask the user to register themselves as administrator.
    form = UserAccountRegistrationForm()
    if form.validate_on_submit():

        site_information = session[hash]["site"]

        user_account = {
            "title": form.title.data,
            "first_name": form.first_name.data,
            "middle_name": form.middle_name.data,
            "last_name": form.last_name.data,   
            "email": form.email.data,
            "is_admin": True,
            "password": form.password.data
        }

        r = requests.post(url_for('auth.new_user', _external=True), json=user_account)

        if r.status_code == 200:
            logout_user()
            return redirect(url_for("setup.complete"))
        else:
            flash("Something terrible has happened. Try again.")
            return redirect(url_for("auth.site_registration"))
        return user_account

    return render_template("setup/admin_registration.html", form=form, hash=hash)

@setup.route("/complete")
def complete():
    return render_template("setup/complete.html")
