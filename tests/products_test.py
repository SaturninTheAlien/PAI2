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
            "name": "operating_system",
            "type": "enum",
            "values": [
                "Linux", "MacOS", "Windows10", "Windows11"
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
        "operating_system": "MacOS"
    }
}

def main():
    
    put("/api/categories/12", computers_category)
    put("/api/products/1", computer1)

if __name__ == "__main__":
    main()
    