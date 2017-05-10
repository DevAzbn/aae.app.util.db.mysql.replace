'use strict';

var azbn = new require(__dirname + '/../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist').argv;

/*
from : '',
to : '',
*/

var db_conf = {
	host : argv.host || 'localhost',
	user : argv.user || 'user',
	password : argv.password || 'password',
	database : argv.database || 'database',
}

var result = {
	tables : {
		
	},
};

azbn.setMdl('async', require('async'));

azbn.mdl('db/mysql', db_conf).connect(function(err){
	
	if(err) {
		
		azbn.echo('Could not connect to mysql: ' + err);
		
	} else {
		
		azbn.echo('DB is connected');
		
		azbn.mdl('db/mysql').query('SHOW TABLES', function(query_err, table_arr, fields) {
			
			if(query_err) {
				
				azbn.echo('MySQL Query Error: ' + query_err);
				
			} else {
				
				/*
				azbn.echo('rows: ' + JSON.stringify(rows));
				azbn.echo('fields: ' + JSON.stringify(fields));
				*/
				
				if(table_arr.length) {
					
					var async_arr = [];
					
					for(var i = 0; i < table_arr.length; i++) {
						
						for(var j in table_arr[i]) {
							
							(function(table_name){
								
								result.tables[table_name] = {
									fields : {},
								};
								
								async_arr.push(function(callback){
									
									azbn.mdl('db/mysql').query('SHOW COLUMNS FROM `' + table_name + '`', function(_query_err, _rows, _fields) {
										
										if(query_err) {
											
											azbn.echo('MySQL Query Error: ' + _query_err);
											
											callback(_query_err, null);
											
										} else if(_rows.length > 0) {
											
											var sql_str = [];
											
											for(var _i = 0; _i < _rows.length; _i++) {
												
												var res = _rows[_i];
												
												//result.tables[table_name].fields[res.Field] = res;
												
												/*
												result.tables[table_name].fields.push({
													name : res.Field,
													type : res.Type,
												});
												*/
												
												//UPDATE wp_posts SET post_content = REPLACE (post_content, 'http://wp.azbn.ru/', 'http://localhost/');
												
												sql_str.push(res.Field + " = REPLACE(" + res.Field + ", '" + argv.from + "', '" + argv.to + "') ");
												
											}
											
											azbn.mdl('db/mysql').query('UPDATE `' + wp_posts + '` SET ' . sql_str.join(), function(__query_err, __rows, __fields) {
												
												callback(__query_err, null);
												
											});
											
										}
										
									});
									
								});
								
							})(table_arr[i][j]);
							
						}
						
					}
					
					azbn.mdl('async').series(async_arr, function (__err, __results) {
						
						//app.saveJSON(db_conf.database, result);
						
						azbn.echo('Changed');
						
						azbn.mdl('db/mysql').end();
						
					});
					
				} else {
					
					azbn.echo('Empty DB: ' + db_conf.database);
					
					azbn.mdl('db/mysql').end();
					
				}
				
			}
			
			//azbn.mdl('db/mysql').end();
			
		});
		
		//azbn.mdl('db/mysql').end();
		
	}
	
});
