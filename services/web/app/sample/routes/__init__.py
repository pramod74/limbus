# Copyright (C) 2019  Keiron O'Shea <keo7@aber.ac.uk>
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

from .. import sample
from flask import render_template, url_for, abort
from flask_login import login_required

from ..forms import SampleFilterForm

import requests


@sample.route("/")
@login_required
def index() -> str:
    sites_response = requests.get(
        url_for("api.site_home_tokenuser", _external=True),
        headers=get_internal_api_header(),
    )

    sites = []
    user_site_id = None
    if sites_response.status_code == 200:
        sites = sites_response.json()["content"]["choices"]
        user_site_id = sites_response.json()["content"]["user_site_id"]

    sampletype_response = requests.get(
        url_for("api.sampletype_data", _external=True),
        headers=get_internal_api_header(),
    )

    sampletypes = []
    if sampletype_response.status_code == 200:
        # print("sampletype_response.json()", sampletype_response.json())
        stypes = sampletype_response.json()["content"]["sampletype_choices"]
        for opt in stypes["FLU"]:
            sampletypes.append(["fluid_type:" + opt[0], opt[1]])
        for opt in stypes["MOL"]:
            sampletypes.append(["molecular_type:" + opt[0], opt[1]])
        for opt in stypes["CEL"]:
            sampletypes.append(["cellular_type:" + opt[0], opt[1]])

    form = SampleFilterForm(sites, sampletypes, data={"current_site_id": user_site_id})
    return render_template(
        "sample/index.html",
        form=form,
        sampletotype=sampletype_response.json()["content"],
    )


@sample.route("/query", methods=["POST"])
@login_required
def query_index():
    response = requests.get(
        url_for("api.sample_query", _external=True),
        headers=get_internal_api_header(),
        json=request.json,
    )

    if response.status_code == 200:
        return response.json()
    else:
        abort(response.status_code)


@sample.route("/biohazard_information")
@login_required
def biohazard_information() -> str:
    return render_template("sample/misc/biohazards.html")


@sample.route("/sampletotypes")
@login_required
def get_sampletotypes():
    sampletype_response = requests.get(
        url_for("api.sampletype_data", _external=True),
        headers=get_internal_api_header(),
    )
    if sampletype_response.status_code == 200:
        return sampletype_response.json()

    return {"content": None, "success": False}


from .add import *
from .protocol import *
from .sample import *
from .aliquot import *
from .review import *
from .attribute import *
from .dispose import *
from .shipment import *
