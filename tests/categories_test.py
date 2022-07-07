#!/usr/bin/python3

import requests

BASE_URL = "http://localhost:3002"

session = requests.Session()
session.auth = ('czesiek', "czesiek123")


def put_category(cat, id:int):
    full_url = BASE_URL + "/api/categories/{}".format(id)
    print("POST "+ full_url)

    r = session.put(full_url, json=cat)
    if r.status_code // 100 != 2:
        print("status_code:{}".format(r.status_code))
        exit(1)

    print(r.json())


def get_test(url):
    full_url = BASE_URL + url
    print("GET "+full_url)

    r = session.get(full_url)
    if r.status_code // 100 != 2:
        print("status_code:{}".format(r.status_code))
        exit(1)

    print(r.json())

cat1 = {
    "name": "Live Birds",
    "attributes": [
        {
            "name": "hatch_date",
            "type": "int"
        }
    ]
}

put_category(cat1, 1)

cat2 = {
    "name": "Chickens",
    "attributes": [
        {
            "name": "breed",
            "type": "str"
        }
    ],
    "parent_id": 1
}

put_category(cat2, 2)

cat3 = {
    "name": "Hens",
    "attributes": [
        {
            "name": "eggs_per_week",
            "type": "int"
        }
    ],
    "parent_id": 2
}

put_category(cat3, 3)

cat4 = {
    "name": "Roosters",
    "attributes": [],
    "parent_id": 2
}

put_category(cat4, 4)

print()
get_test("/api/categories/1/collect_children")

print()
get_test("/api/categories/3/collect_children")

print()
get_test("/api/categories/3/attributes")