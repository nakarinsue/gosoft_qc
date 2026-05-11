from sqlalchemy.orm import Session
from sqlalchemy import text

def get_items_by_id_and_store(db: Session, idcode: list[str], store_id: str):
    if not idcode:
        return []

    query = text("""
        SELECT DISTINCT 
            MAX(i.item_id) AS item_id, 
            MAX(i.item_name) AS item_name, 
            MAX(up.universal_product_id) AS barcode
        FROM item i
        LEFT JOIN (
            SELECT ic.item_id, ic.retail, ic.selling_unit_quantity
            FROM item_control ic
            INNER JOIN store_delivery_area sda
                ON ic.delivery_type_cd = sda.delivery_type_cd
                AND ic.delivery_area_cd = sda.delivery_area_cd
                AND sda.store_id = :store_id 
                AND CURDATE() BETWEEN sda.effective_start_date AND sda.effective_end_date 
            WHERE CURDATE() BETWEEN ic.effective_start_date AND ic.effective_end_date 
        ) RETAIL ON i.item_id = RETAIL.item_id
        LEFT JOIN universal_product up
            ON i.item_id = up.item_id
            AND CURDATE() BETWEEN up.effective_start_date AND up.effective_end_date
            AND up.universal_product_type <> 'E'
        WHERE 
            i.item_id IN :id_list AND
            CURDATE() BETWEEN i.effective_start_date AND i.effective_end_date
        GROUP BY i.item_id
        ORDER BY i.item_id, barcode;
    """)

    result = db.execute(query, {
        "store_id": store_id,
        "id_list": idcode  
    })
    
    return result.mappings().all()