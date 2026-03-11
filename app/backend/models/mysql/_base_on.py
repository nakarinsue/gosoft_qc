from app.backend.database import get_mysql_connection
from app.backend.schemas.all_schemas import  QueryRequest

def connet_mysql(query, params):
    connection = None
    try:
        connection = get_mysql_connection()
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            result_data = cursor.fetchall()
    except:
        result_data =[]
    finally :
        if connection:
            connection.close()
        return result_data 
class Product_and_return_barcode:
    def get_all(self,request:QueryRequest):
        params = list(request.item_codes)
        placeholders = ', '.join(['%s'] * len(params))
        query = f"""
            select i.item_id as product_code, i.item_name as product_name, up.universal_product_type as product_barcode
                from item i
                left join
                (select ic.item_id, ic.retail, ic.selling_unit_quantity
                from item_control ic
                inner join store_delivery_area sda
                on ic.delivery_type_cd = sda.delivery_type_cd
                and ic.delivery_area_cd = sda.delivery_area_cd
                and sda.store_id = '{request.store_code}'
                and CURRENT_DATE()+30 between sda.effective_start_date and sda.effective_end_date
                where CURRENT_DATE()+30 between ic.effective_start_date and ic.effective_end_date
                ) RETAIL
                on i.item_id = retail.item_id
                left join universal_product up
                on i.item_id = up.item_id
                and CURRENT_DATE()+30 between up.effective_start_date and up.effective_end_date
                and up.universal_product_type <> 'E'
                where i.item_id in ({placeholders})
                and CURRENT_DATE()+30 between i.effective_start_date and i.effective_end_date
                group by i.item_id, i.item_name
                order by i.item_id,universal_product_id; 
        """
        print(query)
        resporn =  connet_mysql(query, params)
        return resporn
    



class Product_and_return_barcode_all:
    def get_all(self,request:QueryRequest):
        params = list(request.item_codes)
        placeholders = ', '.join(['%s'] * len(params))
        query = f"""
        select i.item_id, i.item_name, up.universal_product_type, up.universal_product_id
            ,retail.retail, retail.selling_unit_quantity
            ,i.unit_item_id, i.product_set_unit_id
            ,i.product_set_unit_qty, i.receipt_name, i.packing_format, i.pack_qty, i.case_qty
            ,i.pma_cd, i.category_cd, i.sub_category_cd, i.delivery_type_cd
            from item i
            left join
            (select ic.item_id, ic.retail, ic.selling_unit_quantity
            from item_control ic
            inner join store_delivery_area sda
            on ic.delivery_type_cd = sda.delivery_type_cd
            and ic.delivery_area_cd = sda.delivery_area_cd
            and sda.store_id = '{request.store_code}'
            and CURRENT_DATE()+30 between sda.effective_start_date and sda.effective_end_date
            where CURRENT_DATE()+30 between ic.effective_start_date and ic.effective_end_date
            ) RETAIL
            on i.item_id = retail.item_id
            left join universal_product up
            on i.item_id = up.item_id
            and CURRENT_DATE()+30 between up.effective_start_date and up.effective_end_date
            and up.universal_product_type <> 'E'
            where i.item_id in ({placeholders})
            and CURRENT_DATE()+30 between i.effective_start_date and i.effective_end_date
            group by i.item_id, i.item_name
            order by i.item_id,universal_product_id; 
        """
        print(query)
        resporn =  connet_mysql(query, params)
        return resporn