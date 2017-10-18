#!/usr/bin/env node
/*
	输入格式 ： merge [branch分支路径]
*/
"use strict";

// 服务器上分支的路径前缀
const SERVER_PATH = "http://*************/svn/others/branches/";

// trunk本地路径前缀
const TRUNK_LOCAL = "E:\\trunk\\";

// 服务器上trunk的路径前缀
const TRUNK_REMOTE = "http://*************/svn/others/trunk/";

// jenkins-cli.jar的父级地址(注意文件路径不能包含空格哦！)
const JENKINS_PATH = "*************";


let fs = require("fs");

let xlsx = require("xlsx");

// child_process模块用于新建子进程, exec方法用于执行bash命令
let exec = require("child_process").exec; 

// process.argv : [nodeBinary, script, arg1, arg2, ...]
let process = require("process");

let input = process.title.substring(process.title.indexOf("-") + 2);

// node Q模块已被废除，选用原生Promsie
// let Q = require("Q");

// 获取输入的路径
let inputStr = input.replace("merge", "").trim();


/*
* 获取盘符和路径
* path: 需要操作的目录
*/
function getPathInfo(path) {

	//盘符
	let drive = path.slice(0, 1);
	//目录
	let directory = path.slice(2);

	return {
		drive : drive,
		directory : directory
	};
}

/*
* 回退代码处理
*/
function revert(urlLocal, resolve) {
	console.log("=>开始执行revert操作......\n");
	exec(getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn revert " + urlLocal + " -R", function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		console.log(urlLocal + " revert操作执行ok! \n");
		resolve();
	})
}

/*
* 提交代码处理
*/
function commit(urlLocal, suffixTrunk, revisions, resolve) {
	console.log("\n=>开始执行commit操作......");
	exec(getPathInfo(urlLocal).drive + ': && cd ' + getPathInfo(urlLocal).directory + ' && svn commit ' + urlLocal + ' -m "merge  ' + revisions + '  into trunk from ' + suffixTrunk + '"', function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		//若没有要提交的版本 则返回内容为空
		console.log(getPathInfo(urlLocal).drive + ': && cd ' + getPathInfo(urlLocal).directory + ' && svn commit ' + urlLocal + ' -m "merge  ' + revisions + '  into trunk from ' + suffixTrunk + '"')
		console.log("commit 输出:" , stdout)
		console.log(suffixTrunk + " commit 操作执行成功！");
		resolve();
	})
}

/*
* 构建任务处理
*/
function buildTask(urlTrunk) {
	if (!urlTrunk) return;

	if (urlTrunk.indexOf("static_project") >= 0) {
		console.log("=>此为纯前端项目");
		buildStaticProject();
	}
	if (urlTrunk.indexOf("static_zt") >= 0) {
		console.log("=>此为专题");
		buildStaticZt();
	}
	if (urlTrunk.indexOf("node_pro") >= 0) {
		console.log("=>此为node_pro后端项目");
		buildNodePro();
	}
	if (urlTrunk.indexOf("node_loc") >= 0) {
		console.log("=>此为node_loc后端项目");
		buildNodeLoc();
	}
}

/*
* 构建纯前端项目
*/
function buildStaticProject(resolve) {
	exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://*****************************/jenkins/ build H5-and-Nodejs-Cimulation/test-HTML5-cimulation-static_project -s", function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		console.log(stdout);
		console.log("纯前端项目构建结束");
		resolve && resolve();
	})
}

/*
* 构建专题项目
*/
function buildStaticZt(resolve) {
	exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://*****************************/jenkins/ build H5-and-Nodejs-Cimulation/test-HTML5-cimulation-static_zt -s", function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		console.log(stdout);
		console.log("专题项目构建结束");
		resolve && resolve();
	})
}

/*
* 构建NodePro项目
*/
function buildNodePro(resolve) {
	exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://*****************************/jenkins/ build H5-and-Nodejs-Cimulation/test-HTML5-cimulation-node_pro -s", function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		console.log(stdout);

		exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://*****************************/jenkins/ console H5-and-Nodejs-Cimulation/restart_nodePro-cimulation", function(error1, stdout1, stderr1) {
			if (error1) {
				console.log(error1.stack);
				process.exit();
			}
			// console.log(stdout1);
			console.log("NodePro项目构建结束并已重启服务");
			resolve && resolve();
		})
	})
}

/*
* 构建NodeLoc项目
*/
function buildNodeLoc(resolve) {
	exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://*****************************/jenkins/ build H5-and-Nodejs-Cimulation/test-HTML5-cimulation-node_loc -s", function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		console.log(stdout);

		exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://*****************************/jenkins/ console H5-and-Nodejs-Cimulation/restart_nodeLoc-cimulation", function(error1, stdout1, stderr1) {
			if (error1) {
				console.log(error1.stack);
				process.exit();
			}
			// console.log(stdout1);
			console.log("NodeLoc项目构建结束并已重启服务");
			resolve && resolve();
		})

	})
}

/*
* 重启node服务
*/
function restart() {
	console.log("重启开始~");
	exec(getPathInfo(JENKINS_PATH).drive + ": && cd " + getPathInfo(JENKINS_PATH).directory + " && java -jar jenkins-cli.jar -s http://*****************************/jenkins/ build H5-and-Nodejs-Cimulation/restart_nodePro-cimulation -s", function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		console.log(stdout);
		console.log("重启结束~");		
	})
}

/*
* 主程序入口
*/
function main(inputstr) {
	var inputStr = inputstr;

	//若输入的参数为空，则直接退出
	if (!inputStr) {
		console.log("请输入分支路径部分(带构建仿真！！！)");
		process.exit();
	}

	//反斜杠统一替换为正斜杠、去掉字符串中的所有空格、去掉字符串开头和结束的正斜杠
	//由于前后替换的顺序有依赖关系，不建议一次性使用一个正则去判断
	inputStr = inputStr.replace(/\\/g, "/").replace(/\s/g, "").replace(/^\/+|\/+$/g, "");

	if (inputStr === "build") {

		//若输入字符串为build，依次构建各个项目
		Promise.resolve()
			.then(function(data) {
				return new Promise(function(resolve, reject) {
					buildStaticProject(resolve);
				})
			})
			.then(function(data) {
				return new Promise(function(resolve, reject) {
					buildStaticZt(resolve);
				})
			})
			.then(function(data) {
				return new Promise(function(resolve, reject) {
					buildNodePro(resolve);
				})
			})
			.then(function(data) {
				return new Promise(function(resolve, reject) {
					buildNodeLoc(resolve);
				})
			})
	} else {
		//判断输入的路径是否满足要求
		if (inputStr.indexOf("/") <= -1) {
			console.log("路径中不存在/,请检查路径是否正确");
			process.exit();
		}

		//截取第一个"/"之后的路径
		let str = inputStr;
		let suffixTrunk = str.slice(str.indexOf("/") + 1);
		let suffixBranch = inputStr;

		//被合并的branch服务器路径
		let urlBranches = SERVER_PATH + suffixBranch;

		//需要合并的trunk本地路径
		let urlLocal = TRUNK_LOCAL + suffixTrunk;

		//trunk的服务器路径
		let urlTrunk = TRUNK_REMOTE + suffixTrunk;

		/*
		* 程序主逻辑模块
		*/
		exec(getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn update && svn log " + TRUNK_REMOTE + " -l 1 -q", function(error, stdout, stderr) {
			if (error) {
				console.log(urlLocal + "路径无效，请检查路径是否正确!");
				console.log(error.stack);
				process.exit();
			}
			console.log("\n**************************************************************\n" + urlLocal + "路径有效~\n");
			let last_version = /r(\d+)/.exec(stdout)[1];

			new Promise(function(resolve, reject) {
				revert(urlLocal, resolve);
			}).then(function(data) {

				//获取merge过来的所有版本信息
				exec(getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn mergeinfo --show-revs=eligible " + urlBranches + " " + urlTrunk, function(error1, stdout1, stderr1) {
					if (error1) {
						console.log(error1.stack);
						process.exit();
					}

					//该步需要在上一步执行完之后再执行
					//若命令执行结果为空，则没有需要合并的版本
					if (!stdout1) {
						console.log("WARN : 没有需要合并的版本!");
						process.exit();
					} else {
						let revisions = /r(\d+)/.exec(stdout1)[1];
						console.log("trunk分支最新版本：" + last_version);
						console.log("branch分支最新版本：" + revisions);
						console.log("\n=>开始执行merge操作......");

						//执行merge操作，并将该操作返回的信息存入 与当前脚本同一目录的output.txt文件
						exec(getPathInfo(urlLocal).drive + ": && cd " + getPathInfo(urlLocal).directory + " && svn merge --accept mc " + urlBranches, function(error2, stdout2, stderr2) {
							
							// 如果出现冲突，则终止合并，并revert；否则，进行提交、构建操作
							if (error2) {
								
								//TODO 需测试该操作冲突时具体返回的是什么
								console.log(suffixBranches + "合并出现了冲突！");
								revert(urlLocal);
								console.log("执行完毕，自动有冲突，请手动合并（已回退本地合并内容）!")
								console.log(error2.stack);
								process.exit();
							}

							//merge返回的数据，若有"C"，则表明有冲突
							let resultArr = stdout2.split("\n");
							let conflictTag = false;
							for (let i = 0, len = resultArr.length; i < len; i++) {
								if (resultArr[i].slice(0, 2).indexOf("C") >= 0) {
									conflictTag = true;
									break;
								};
							}

							if (conflictTag) {

								//有冲突的情况
								revert(urlLocal);
								console.log("执行完毕，自动有冲突，请手动合并（已回退本地合并内容）!")
							} else {

								//无冲突的情况
								console.log(stdout2);
								console.log("merge操作结束！");
								new Promise(function(resolve1, reject1) {
									commit(urlLocal, suffixTrunk, revisions, resolve1);
								}).then(function(res) {
									buildTask(urlTrunk);
								})
							}
						})
					}
				})
			});
		})
	}
}


main(inputStr);