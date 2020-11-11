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

from ...database import db, Base
from ...mixins import RefAuthorMixin, RefEditorMixin, UniqueIdentifierMixin


class ColdStorageShelf(Base, RefAuthorMixin, RefEditorMixin, UniqueIdentifierMixin):
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    z = db.Column(db.Integer)
    storage_id = db.Column(db.Integer, db.ForeignKey("coldstorage.id"))
    storage = db.relationship("ColdStorage")

    
    samples = db.relationship(
        "Sample",
        secondary="entitytostorage",
        primaryjoin="ColdStorageShelf.id==EntityToStorage.shelf_id",
        uselist=True
    )
