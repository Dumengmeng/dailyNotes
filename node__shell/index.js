#!/usr/bin/env node

/*
    输入格式 ： compare (trunk分支绝对路径)  (trunk-version-start)  (trunk-version-end)
*/


//trunk路径  变为常量，show log无需再根据相对路径进行查找
var TRUNK_URL = "http://**********/svn/others/trunk";
//excel表格路径
var EXCEL_URL = "F:\\node_compare";
//excel表格名字(文件格式必须为xlsx)
var EXCEL_NAME = "task_test.xlsx";




var fs = require("fs");
var xlsx = require("xlsx");
// var program = require("commander");
var exec = require("child_process").exec; //child_process模块用于新建子进程,exec方法用于执行bash命令
var process = require("process");// process.argv : [nodeBinary, script, arg1, arg2, ...]
var input = process.title.substring(process.title.indexOf("-") + 2);

var params = {
    trunkVersion_min : process.argv[3],
    trunkVersion_max : process.argv[4],
    h5_data : [],
    log_data : [],
    getH5_tag : false,
    getLog_tag : false
}

var fn = {

    param_verify : function() {
        var reg_path = /[cdef]:[\/|\\]((\w+)([\/|\\]?))+/i;
        var is_excelUrl = reg_path.test(EXCEL_URL);
        var not_version = false;

        if (process.argv.length === 3) {
            trunkV_start = process.argv[2];
            not_version = /\D+/g.test(trunkV_start);
        }

        if (process.argv.length === 4) {
            trunkV_start = process.argv[2];
            trunkV_end = process.argv[3];
            not_version = /\D+/g.test(trunkV_start) || /\D+/g.test(trunkV_end);
        }

        if (process.argv.length > 4 || process.argv.length <= 2 || not_version || !is_excelUrl) {
            console.log("please input : compare [trunkVersion_start] [trunkVersion_end]");

            if (!is_trunkUrl || !is_excelUrl) {
                console.log("notice : please input a correct path");
            }

            if (not_version) {
                console.log("notice : please input a correct version");
            }

            process.exit();
        }

    },

    output_data : function(data, url, type) {
        var desc, data_seg = [];

        if (!Array.isArray(data) || data.length < 0) {
            return ;
        }

        if (type !== "compare") {
            desc = data.slice(0,1);
            data_seg = data.slice(1).sort();
            data = desc.concat(data_seg);
        } 

        // 去重
        var data_unique = [];
        for (var x = 0, len = data.length; x < len; x++) {
            if (data_unique.indexOf(data[x]) == -1 && data[x]) {
                data_unique.push(data[x]);
                data_unique.push("\n");
            }
        }

        //将查询的数据写出
        fs.stat(EXCEL_URL + '\\result', function(err, stat) {
            if (err === null) {
                fs.open(url, "w", 0666, function(err) {
                    if (err) {
                        console.log(url);
                    }
                    fs.writeFile(url, data_unique, "utf8", function (err1) {
                        if (err1) {
                            console.log(err1);
                        }
                        console.log("---" + url + '文件输出成功\n');
                    }); 
                 })
        
            } else if (err.code === "ENOENT") {
                //文件夹不存在
                fs.mkdir(EXCEL_URL + '\\result', 0777, function (err) {
                  if (err) throw err;

                  fs.open(url, "w", 0666, function(err) {
                    if (err) {
                        console.log(url);
                    }
                    fs.writeFile(url, data_unique, "utf8", function (err1) {
                        if (err1) {
                            console.log(err1);
                        }
                        console.log("---" + url + '文件输出成功\n');
                    }); 
                 })
                });
            }
        })

    },

    geth5Data : function(callback) {

        if (!EXCEL_URL || !EXCEL_NAME) {
            return;
        }

        try {
            var workbook = xlsx.readFile(EXCEL_URL + "\\" + EXCEL_NAME);
        } catch (e) {
            console.log(EXCEL_NAME + "文件不存在");
            process.exit()
        }

        // 获取 Excel 中所有表名
        var sheetNames = workbook.SheetNames;
        // 根据表名获取对应某张表
        // var workSheet = workbook.Sheets[sheetNames[0]];
        // var a1 = workSheet["A1"];
        var worksheet = workbook.Sheets[sheetNames[0]];
        var headers = {};
        var data = [];

        for (var z in worksheet) {
            if(z[0] === '!') continue;
            //parse out the column, row, and value
            var col = z.substring(0,1);
            var row = parseInt(z.substring(1));
            var value = worksheet[z].v;

            //store header names
            if(row == 1) {

                if (worksheet[z].v == "涉及工程" || worksheet[z].v == "开发分支") {
                    headers[col] = worksheet[z].v == "涉及工程" ? "relate_pro" : "dev_branch";
                }
                continue;
                
            }

            if(!data[row]) data[row]={};
            data[row][headers[col]] = value;
        }

        //筛选出H5项目
        params.h5_data[0] = "禅道表格里的所有路径 ： \n"
        var per = [], o;
        for (var i = 0, len = data.length; i < len; i++) {
            if (data[i] && data[i].relate_pro.indexOf("h5") != -1) {


                if (/\s+/.test(data[i].dev_branch) || /\r/g.test(data[i].dev_branch)) {
                    if (/\s+/g.test(data[i].dev_branch)) {
                        //匹配空格
                        per = data[i].dev_branch.replace(/http:\/\/10.200.3.7\/svn\/others\/branches\/\w+/g, "").replace(/\s+/g, ",").split(",");
                        for (var ik = 0, lenk = per.length; ik < lenk; ik++) {
                            per[ik] = per[ik].replace(/[\u4e00-\u9fa5|\s]/g, "").replace(/\/$/, "");
                        }
                        params.h5_data = params.h5_data.concat(per);
                    }
                
                    if (/\r/g.test(data[i].dev_branch)) {
                        //匹配换行
                        per = data[i].dev_branch.replace(/http:\/\/10.200.3.7\/svn\/others\/branches\/\w+/g, "").replace(/[\r\n]/g, ",").split(",");
                        //匹配掉汉字
                        for (var ik = 0, lenk = per.length; ik < lenk; ik++) {
                            per[ik] = per[ik].replace(/[\u4e00-\u9fa5|\s]/g, "").replace(/\/$/, "");
                        }
                        params.h5_data = params.h5_data.concat(per)
                    }

                    continue;
                }

                data[i].dev_branch.replace(/\/$/, "").replace(/[\u4e00-\u9fa5|\s]/g, "");
                params.h5_data.push(data[i].dev_branch.replace(/http:\/\/10.200.3.7\/svn\/others\/branches\/\w+/g, "").replace(/[\u4e00-\u9fa5|\s]/g, ""));

                
            }
        }

        fn.output_data(params.h5_data, EXCEL_URL + "\\result\\chandao_data.txt");
        params.getH5_tag = true;
        return callback();
    },

        
    getLogData : function(callback) {
        //调出svn log信息并打印出来
        var testdata;
        var reg = /\/trunk((?:(?:\/?)(?:[a-zA-Z0-9_.-]+)(?:\/?))*)/g;
        var disc = TRUNK_URL.slice(0,2);
        var path = TRUNK_URL.slice(2);
        var last_version;

        if (process.argv.length === 3) {
            exec("svn log " + TRUNK_URL + " -l 1 -q", function(error, stdout, stderr) {
                if (error) {
                    console.log(error.stack);
                    console.log("Error code : " + error.code);
                    process.exit();
                }
                last_version = /r(\d+)/.exec(stdout)[1];

                exec("svn log " + TRUNK_URL + " -v -r " + process.argv[2] + ":" + last_version, {
                    encoding: 'utf8',
                    maxBuffer: 50000 * 1024
                }, function(error, stdout, stderr) {
                    if (error) {
                        console.log(error.stack);
                        console.log("Error code : " + error.code);
                        process.exit();
                    }
                    testdata = stdout.toString().match(reg);
                    params.log_data[0] = "trunk指定版本" + process.argv[2] + "-" + last_version + "间出现的所有路径 : \n"
                    for (var i = 0, len = testdata.length; i < len; i++) {
                        if (testdata[i] && testdata[i].indexOf("\/") != -1) {
                            params.log_data.push(testdata[i].replace("/trunk", ""));
                        }
                    }
                    fn.output_data(params.log_data, EXCEL_URL + "\\result\\trunk_data.txt");
                    params.getLog_tag = true;
                    return callback();
                })
            })
        } 

        if (process.argv.length === 4) {
            exec("svn log " + TRUNK_URL + " -v -r " + process.argv[2] + ":" + process.argv[3], {
                encoding: 'utf8',
                maxBuffer: 50000 * 1024
            }, function(error, stdout, stderr) {
                if (error) {
                    console.log(error.stack);
                    console.log("Error code : " + error.code);
                    process.exit();
                }
                testdata = stdout.toString().match(reg);
                params.log_data[0] = "------trunk指定版本" + process.argv[2] + "-" + process.argv[3] + "间出现的所有路径--------\n"
                for (var i = 0, len = testdata.length; i < len; i++) {
                    if (testdata[i] && testdata[i].indexOf("\/") != -1) {
                        params.log_data.push(testdata[i].replace("/trunk", ""));
                    }
                }
                fn.output_data(params.log_data, EXCEL_URL + "\\result\\trunk_data.txt");
                params.getLog_tag = true;
                return callback();
            })
        }
    },

    compare : function(h5_data, log_data) {

        var res_h5 = [], res_log = [], i, j, len1, len2;
        var tem_log1 = [], tem_log2 = [];
        var reg = /(\/[\w.-]+)+/;
        
        if (h5_data.length < 0 || log_data.length < 0) {
            return;
        } 

        //删除数组里的第一句描述
        h5_data.shift();
        log_data.shift();


        //筛选禅道列表有，show log里边没有的路径
        res_h5 = h5_data.map(function(item, i) {
            return log_data.some(function(ele, j) {
                return ele.includes(item);
            }) ? undefined : item;
        })
        res_h5.unshift('------------禅道列表有，trunk记录没有的路径------------------------\n');

        //筛选禅道列表没有，show log里边有的路径
        // res_log = log_data.map(function(item, i){
        var item, elem, tag = false;
        for (var x = 0, l = log_data.length; x < l; x++) {
            item = log_data[x];
            
            for (var i = 0, len = h5_data.length; i < len; i++) {
                elem = h5_data[i];

                if (item.includes(elem)) {
                    if (/(node_pro|node_loc)/.test(item)) {
                        tag = false;
                        break;
                    }
                    if (/(static_project|static_zt)/.test(item)) {
                        if (elem.replace(/\//g, "") === "static_project" || elem.replace(/\//g, "") === "static_zt") {
                            continue;
                        }
                        tag = false;
                        break;
                    }
                }

                tag = true;
            }

            if (tag) {
                res_log.push(item)
            }
        }

        tem_log1 = res_log.filter(function(item, i) {
            return item && item.match(reg)[1].indexOf(".") >= 0;
        })
        tem_log1.unshift("------------  all files  --------- ")
        tem_log1.push("\n\n\n\n");
        tem_log2 = res_log.filter(function(item, i) {
            return item && item.match(reg)[1].indexOf(".") <= -1;
        })
        tem_log2.unshift("------------  all paths ------------ ")
        res_log = tem_log1.concat(tem_log2)

        res_log.unshift('-----------禅道列表没有，trunk记录有的路径------------------------');

        // 将对比结果输出到文件中
        fn.output_data(res_h5.concat(res_log), EXCEL_URL + "\\result\\comp_result.txt", 'compare');

    },

    doCompare : function() {
        //获取到 h5data 和 logdata 之后再执行callback
        if (params.getH5_tag && params.getLog_tag) {
            fn.compare(params.h5_data, params.log_data);    
        }
    },

    init : function() {
        this.param_verify();
        this.geth5Data(fn.doCompare);
        this.getLogData(fn.doCompare);
    }
}

fn.init();




