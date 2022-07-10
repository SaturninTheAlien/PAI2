#!/usr/bin/python3
from common import get, post, put
import categories_test


duck1 = {
    "name": "Kaczka dziwaczka",
    "category_id": 1,
    "price": 450,
    "attributes": {
        "hatch_date": 1657389607
    }
}

rooster1 = {
    "name": "Kogut gustaw",
    "category_id": 4,
    "price": 320,
    "attributes": {
        "hatch_date": 1591804807,
        "breed": "leghorn"
    }
}

def main():
    categories_test.main()
    put("/api/products/2", duck1)
    put("/api/products/3", rooster1)

    #Wszystkie produkty z kategorii "Żywe ptaki"
    #Kaczka dziwaczka i kogut gustaw
    get("/api/products?category_id=1")

    #Produkty z kategorii "Żywe ptaki" bez subkategorii (pozostałe)
    #Tylko kaczka dziwaczka
    get("/api/products?category_id=1&exlude_subcategories=true")

    #Filtrowanie po atrybutach
    get("/api/products?category_id=1&hatch_date=1591804807")

    #Filtrowanie po atrybutach, wartość maksymalna, minimalna, tylko dla typów numerycznych
    get("/api/products?category_id=1&hatch_date_min=1591804807&hatch_date_max=1657389606")


if __name__ == "__main__":
    main()

