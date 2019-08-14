var contentType;
var bodystr;
var headers;
var parameters;
var zname;
var zvalue;
var zvalue1;
var zvalue2;
var zvalue3;
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
function processRequest() { $.trace.error('1');
	if (validateInput()) {
		try {
			switch ($.request.method) {
				//Handle your GET calls here
				case $.net.http.GET:
				     $.trace.error('1');
					parameters = $.request.parameters;
					for (var i = 0; i < parameters.length; i++) {
						zname = parameters[i].name;
						if (zname == 'echostr') {
							zvalue = parameters[i].value;
							$.trace.error('echostr :' + zvalue);
						}
						//                            if (zname == 'signature') {
						//                                            zvalue = parameters[i].value;
						//                                                            $.trace.error('signature:' + zvalue);
						//                            };
						//                            if (zname == 'timestamp') {
						//                                            zvalue = parameters[i].value;
						//                                            $.trace.error('timestamp :' + zvalue);
						//                            };
						//                            if (zname == 'nonce') {
						//                                            zvalue = parameters[i].value;
						//                                            $.trace.error('nonce :' + zvalue);
						//                            };
					}
					$.trace.error('2');
					$.response.status = $.net.http.OK;
					$.response.setBody(zvalue);
					break;
					//            //Handle your POST calls here
				case $.net.http.POST:
					//bodystr = $.request.body ? $.request.body.asString() : undefined;
					bodystr = $.request.body.asString();
                    
					var id = 0;
					$.trace.error(bodystr);
					var connpost = $.db.getConnection("Chunge::request"); // Create Connection used SQL Connection
					$.trace.error('b');
					connpost.prepareStatement("SET SCHEMA " + "\"CWU\"").execute(); // Setting the SCHEMA
                    $.trace.error('2');
					var pStmtpost = connpost.prepareStatement("select max( \"id\" ) from " + "\"Chunge.data::DigAccMessage.Message\"");
					var rspost = pStmtpost.executeQuery();
					if (rspost.next()) {
						id = Number(rspost.getNString(1)) + 1;
					}
					rspost.close();
                    $.trace.error('3');
					pStmtpost = connpost.prepareStatement("insert INTO " + "\"Chunge.data::DigAccMessage.Message\"" +
						'("id", "createdTime", "content" ,"digaccid" ) values(?, now(), ? , ?)');
					pStmtpost.setInteger(1, id);
					pStmtpost.setNString(2, bodystr);
					pStmtpost.setNString(3, 'hybrislocalization');
					pStmtpost.executeUpdate();
					$.trace.error('4');
					pStmtpost.close();

					// All database changes must be explicitly commited
					connpost.commit();
					if (connpost) {
						connpost.close();
					}

					var reply;
					var markuser;
					var markclick;
					var openid;

					var bodyaf = $.request.body.asArrayBuffer();
					var parser = new $.util.SAXParser();

					parser.startElementHandler = function(name, attrs) {
						var data = attrs; // use attrs object with all properties as template
						data.name = name; // add the name to the object
						if (name === 'FromUserName') {
							markuser = 'X';
						}
					};

					parser.characterDataHandler = function(s) {

						if (markuser === 'X') {
							openid = s;
							markuser = '';
						}
						if (s === 'onlive_service') {
							reply =
								'<xml><ToUserName><![CDATA[' + openid + ']]></ToUserName><FromUserName><![CDATA[gh_7c2518c75a2f]]>' +
								'</FromUserName><CreateTime>12345678</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' +
								'Welcome to our online service. Please select your preferred language: "1" for English, "2" for Chinese.\r\n' +
								'欢迎您访问在线客服，请选择您喜欢的语言：1.英文服务 2.中文服务 ' + ']]></Content></xml>';
							$.response.status = $.net.http.OK;
							$.response.setBody(reply);
							$.response.contentType = "text/xml";
							markclick = 'X';
						}
						if (s === 'subscribe') {
							reply =
								'<xml><ToUserName><![CDATA[' + openid + ']]></ToUserName><FromUserName><![CDATA[gh_7c2518c75a2f]]>' +
								'</FromUserName><CreateTime>12345678</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' +
								'谢谢关注，诚邀您注册我们的活动，请按以下格式输入注册信息：姓名+手机号码+邮箱+购买意向(一周内/一月内/三月内)' + ']]></Content></xml>';
							$.response.status = $.net.http.OK;
							$.response.setBody(reply);
							$.response.contentType = "text/xml";
							markclick = 'X';
						}
					};

					parser.parse(bodyaf);
					if (!markclick === 'X') {
						$.response.status = $.net.http.OK;
						$.response.setBody('success');
					}

					break;
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