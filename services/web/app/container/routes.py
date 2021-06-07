# Copyright (C) 2021  Keiron O'Shea <keo7@aber.ac.uk>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

from ..container import container
from flask import render_template, url_for, flash, redirect
from flask_login import current_user, login_required
from .forms import NewContainerForm, NewFixationType
import requests
from ..misc import get_internal_api_header

@container.route("/")
@login_required
def index():
    return render_template("container/index.html")


@container.route("/data")
def index_data():
    container_response = requests.get(
        url_for("api.container_index", _external=True),
        headers=get_internal_api_header()
    )

    return (
            container_response.text,
            container_response.status_code,
            container_response.headers.items()
    )


@container.route("/view/container/<id>")
def view_container(id: int):
    return "Hello World"


@container.route("/view/container/<id>/data")
def view_container_data(id: int):
    container_response = requests.get(
        url_for("api.container_view_container", id=id, _external=True),
        headers=get_internal_api_header()
    )

    return (
            container_response.text,
            container_response.status_code,
            container_response.headers.items()
    )


@container.route("/new/container", methods=["GET", "POST"])
@login_required
def new_container():
    form = NewContainerForm()

    if form.validate_on_submit():

        data = {
            "container": {
                "name": form.name.data,
                "manufacturer": form.name.data,
                "description": form.name.data,
                "colour": form.colour.data,
                "used_for": form.used_for.data,
                "temperature": form.temperature.data
            },
            "cellular": form.cellular.data,
            "fluid": form.fluid.data,
            "tissue": form.tissue.data,
            "sample_rack": form.sample_rack.data
        }

        new_container_response = requests.post(
            url_for("api.new_container", _external=True),
            headers=get_internal_api_header(),
            json=data
        )

        if new_container_response.status_code == 200:
            flash("Container successfully added")
            return redirect(url_for("container.index"))
        else:
            flash(new_container_response.content)
    return render_template("container/new/container.html", form=form)


@container.route("/new/fixation")
@login_required
def new_fixation_type():
    form = NewFixationType()

    return render_template("container/new/fixation.html", form=form)