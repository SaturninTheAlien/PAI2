#!/usr/bin/python3

from common import get, put

def put_category(category, id:int):
    return put("/api/categories/{}".format(id), json=category)

category1 = {
    "name": "Live Birds",
    "attributes": [
        {
            "name": "hatch_date",
            "type": "int"
        }
    ]
}



category2 = {
    "name": "Chickens",
    "attributes": [
        {
            "name": "breed",
            "type": "str"
        }
    ],
    "parent_id": 1
}



category3 = {
    "name": "Hens",
    "attributes": [
        {
            "name": "eggs_per_week",
            "type": "int"
        }
    ],
    "parent_id": 2
}


category4 = {
    "name": "Roosters",
    "attributes": [],
    "parent_id": 2
}

if __name__ == "__main__":

    put_category(category1, 1)
    put_category(category2, 2)
    put_category(category3, 3)
    put_category(category4, 4)

    print("|--------------------------|")
    get("/api/categories/1/collect_children")

    print("|--------------------------|")
    get("/api/categories/3/collect_children")

    print("|--------------------------|")
    get("/api/categories/3/attributes")

    #This involves a potential client bug, but it shouldn't crash the system.
    category1["parent_id"] = 4
    put_category(category1, 1)

    print("|--------------------------|")
    get("/api/categories/1/collect_children")

    print("|--------------------------|")
    get("/api/categories/3/collect_children")

    print("|--------------------------|")
    get("/api/categories/3/attributes")

    category1["parent_id"] = None
    put_category(category1, 1)
