#!/usr/bin/python3
from common import  get, post, put

computers_category = {
    "name": "computers",
    "attributes": [
        {
            "name": "manufacturer",
            "type": "enum",
            "values": [
                "Apple", "HP", "Acer", "Asus", "MSI"
            ],
        },
        {
            "name": "weight",
            "type": "double",
            "suffix": " kg"
        },
        
        {
            "name": "disk_volume",
            "type": "int",
            "suffix": " GB"
        }
    ]
}

computer1 = {
    "name": "MacBook Air",
    "category_id": 12,
    "price": 5799,
    "attributes": {
        "weight": 1.29,
        "disk_volume": 256,
        "manufacturer": "Apple",
    }
}

if __name__ == "__main__":
    #computers_category = post("/api/categories", computers_category)
    computers_category = put("/api/categories/12", computers_category)

    #computer1 = post("/api/products", computer1)
    computer1 = put("/api/products/1", computer1)
    