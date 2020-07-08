from ... import db

from ..models import *
from ...auth.views import UserView
from ...sample.views import BasicSampleView
from .cryobox import BasicCryoboxView


def BasicShelfView(shelf_id: int) -> dict:
    shelf = (
        db.session.query(FixedColdStorageShelf)
        .filter(FixedColdStorageShelf.id == shelf_id)
        .first_or_404()
    )

    return {
        "id": shelf.id,
        "name": shelf.name,
        "creation_date": shelf.creation_date,
        "update_date": shelf.update_date,
        "author_information": UserView(shelf.author_id),
    }


def ShelfView(shelf_id: int) -> dict:

    data = BasicShelfView(shelf_id)

    boxes = (
        db.session.query(CryovialBox)
        .join(CryovialBoxToFixedColdStorageShelf)
        .filter(CryovialBoxToFixedColdStorageShelf.shelf_id == shelf_id)
        .all()
    )
    samples = (
        db.session.query(SampleToFixedColdStorageShelf)
        .filter(SampleToFixedColdStorageShelf.shelf_id == shelf_id)
        .join(FixedColdStorageShelf)
        .all()
    )
    data["samples"] = {x.id: BasicSampleView(x.id) for x in samples}
    data["cryoboxes"] = {x.id: BasicCryoboxView(x.id) for x in boxes}

    return data
