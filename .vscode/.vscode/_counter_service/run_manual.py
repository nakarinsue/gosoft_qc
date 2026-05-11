from core.data_manager import DataManager
from core.flow_manager import RequestFlowManager
from core.api_client import CounterServiceClient
from core.excel_manager import ExcelReportManager
from utils.logger import SystemLogger

def main():
    """Execution script for testing isolated core components seamlessly."""
    try:
        SystemLogger.show("Initializing Enterprise Data Manager...")
        req_data = {"VENDOR_ID": "82204", "SERVICE_ID": "00", "STORE_ID": "09892"}
        opt_data = {"SEQ_NO": None, "REF_ID": None} 
        
        data_mgr = DataManager(required_data=req_data, optional_data=opt_data)
        payload = data_mgr.get_final_payload()
        
        SystemLogger.show("Starting Automation Flow Pipeline...")
        api_client = CounterServiceClient()
        flow = RequestFlowManager(api_client)
        
        pipeline_actions = ["exchange", "save", "confirm"]
        final_result = flow.run_pipeline(pipeline_actions, payload)
        
        SystemLogger.show("Constructing Excel Report Matrix...")
        excel_mgr = ExcelReportManager()
        excel_mgr.write_data_to_sheet("Transaction", [payload]) # type: ignore
        
        log_entry = [{"status": "success", "recorded_action": "pipeline_execution_completed"}]
        excel_mgr.write_data_to_sheet("Log", log_entry) # type: ignore
        
        excel_mgr.save_to_file("Enterprise_Execution_Report.xlsx") # type: ignore
        
        SystemLogger.show("Process Matrix Finalized Successfully.")
        SystemLogger.display(final_result)

    except Exception as e:
        SystemLogger.error_traceback(e)

if __name__ == "__main__":
    main()