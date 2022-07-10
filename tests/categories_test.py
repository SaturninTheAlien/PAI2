#!/usr/bin/python3

from common import get, put

def put_category(category, id:int):
    return put("/api/categories/{}".format(id), json=category)

live_birds_category = {
    "name": "Żywe ptaki",
    "attributes": [
        {
            "name": "hatch_date",
            "type": "int"
        }
    ]
}



chickens_category = {
    "name": "Żywe kurczaki",
    "attributes": [
        {
            "name": "breed",
            "type": "string"
        }
    ],
    "parent_id": 1
}



hens_category = {
    "name": "Kury",
    "attributes": [
        {
            "name": "eggs_per_week",
            "type": "int"
        }
    ],
    "parent_id": 2
}


roosters_category = {
    "name": "Koguty",
    "attributes": [],
    "parent_id": 2
}

def main():
    put_category(live_birds_category, 1)
    put_category(chickens_category, 2)
    put_category(hens_category, 3)
    put_category(roosters_category, 4)

    print("|--------------------------|")
    get("/api/categories/1/collect_children")

    print("|--------------------------|")
    get("/api/categories/3/collect_children")

    print("|--------------------------|")
    get("/api/categories/3/attributes")

    #This involves a potential client bug, but it shouldn't crash the system.
    live_birds_category["parent_id"] = 4
    put_category(live_birds_category, 1)

    print("|--------------------------|")
    get("/api/categories/1/collect_children")

    print("|--------------------------|")
    get("/api/categories/3/collect_children")

    print("|--------------------------|")
    get("/api/categories/3/attributes")

    live_birds_category["parent_id"] = None
    put_category(live_birds_category, 1)


if __name__ == "__main__":
    main()
