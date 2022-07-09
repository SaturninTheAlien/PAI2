#!/usr/bin/python3

import requests
BASE_URL = "http://localhost:3002"

session = requests.Session()
session.auth = ('czesiek', "czesiek123")

def get(url):
    full_url = BASE_URL + url
    print("GET "+full_url)

    r = session.get(full_url)
    if r.status_code // 100 != 2:
        print("status_code:{}".format(r.status_code))
        print(r.content.decode("utf-8"))
        exit(1)

    rj = r.json()
    print(rj)
    print()

    return rj


def post(url, json):
    full_url = BASE_URL + url
    print("GET "+full_url)

    r = session.post(full_url, json=json)
    if r.status_code // 100 != 2:
        print("status_code:{}".format(r.status_code))
        print(r.content.decode("utf-8"))
        exit(1)
    
    rj = r.json()
    print(rj)
    print()

    return rj

def put(url, json):
    full_url = BASE_URL + url
    print("PUT "+full_url)

    r = session.put(full_url, json=json)
    if r.status_code // 100 != 2:
        print("status_code:{}".format(r.status_code))
        print(r.content.decode("utf-8"))

        exit(1)
    
    rj = r.json()
    print(rj)
    print()

    return rj

def main():
    get("/api/auth/my_account")

    tmp = post("/api/auth/login", {
        "username": "czesiek",
        "password": "czesiek123"
    })


    r = requests.get(BASE_URL + "/api/auth/my_account",
    headers={"Authorization":"Bearer {}".format(tmp["token"])})

    print(r.status_code)
    print(r.json())


if __name__ == "__main__":
    main()
    pass