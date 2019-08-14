var contentType;
var bodystr;
var headers;
var parameters;
var zname;
var zvalue;
// Check Content type headers and parameters
function validateInput() {

	// Check content-type is application/json
	contentType = $.request.contentType;

	//if ( contentType === null || contentType.startsWith("application/json") === false){
	//            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	//            $.response.setBody("Wrong content type request use application/json");
	//            return false;
	//}

	return true;
}

// Request process
function processRequest() {
	if (validateInput()) {
		try {
			switch ($.request.method) {
				//Handle your GET calls here
				case $.net.http.GET:

					var messages = [];
					var idmin = 0;
					var connget = $.db.getConnection("Chunge::request");
					connget.prepareStatement("SET SCHEMA " + "\"CWU\"").execute(); // Setting the SCHEMA

					var pStmtget = connget.prepareStatement('select "id", "createdTime", "content" ,"header" , "digaccid" from ' +
						"\"Chunge.data::DigAccMessage.Message\""); //+ 'limit 1');
					var rsget = pStmtget.executeQuery();

					while (rsget.next()) {
						idmin = Number(rsget.getNString(1));
						messages.push({
							//id: rsget.getInteger(1),
							//createdTime: rsget.getTimestamp(2),
							content: rsget.getNString(3),
							header: rsget.getNString(4),
							digaccid: rsget.getNString(5)
						});
						var pStmtdel = connget.prepareStatement('delete from ' + "\"Chunge.data::DigAccMessage.Message\"" + 'where "id" = ' + idmin);
						var rsdel = pStmtdel.executeUpdate();
						connget.commit();
						//            if (connget) {
						//                            connget.close();
						//            }
					}
					// rsget.close();

					$.response.status = $.net.http.OK;
					$.response.setBody(JSON.stringify(messages));

					//            var pStmtdel = connget.prepareStatement('delete from ' + "\"ericlinepackage.data::DigAccMessage.Message\"" + 'where "id" = ' + idmin );
					//            var rsdel = pStmtdel.executeUpdate();
					//     connget.commit();
					//            if (connget) {
					//                            connget.close();
					//            }
					break;
					//            //Handle your POST calls here
				case $.net.http.DEL:
					break;
					//Handle your other methods: PUT, DELETE
				default:
					$.response.status = $.net.http.METHOD_NOT_ALLOWED;
					$.response.setBody("Wrong request method");
					break;
			}
			$.response.contentType = "application/json";
		} catch (e) {
			$.response.setBody("Failed to execute action: " + e.toString());
		}
	}

}

// Call request processing  
try {
	processRequest();
} catch (e) {
	// return the error as JSON for debugging

	var errorResponse = {
		"error": e.toString()
	};
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify(errorResponse));

}