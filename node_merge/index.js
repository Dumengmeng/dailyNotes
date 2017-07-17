#!/usr/bin/env node
/*
	输入格式 ： merge [branch分支路径]
*/
"use strict";

//服务器上分支的路径前缀
const SERVER_PATH = "http://***********/svn/others/branches/";

//trunk本地路径前缀
const TRUNK_LOCAL = "E:\\trunk\\";

//服务器上trunk的路径前缀
const TRUNK_REMOTE = "http://***********/svn/others/trunk/";

//jenkins-cli.jar的父级地址(注意文件路径不能包含空格哦！)
const JENKINS_PATH = "D:\\ProgramFiles\\jenkins";


let fs = require("fs");

let xlsx = require("xlsx");

//child_process模块用于新建子进程, exec方法用于执行bash命令
let exec = require("child_process").exec; 

// process.argv : [nodeBinary, script, arg1, arg2, ...]
let process = require("process");

let input = process.title.substring(process.title.indexOf("-") + 2);

//TODO node的异步操作模块 还是 promise 
// let Q = require("Q");

//获取输入的路径
let inputStr = input.replace("merge", "").trim();


if (!inputStr) {
	console.log("请输入分支路径部分(带构建仿真！！！)");
	process.exit();
}

//若输入字符串为build，则执行构建操作
if (inputStr === "build") {
	exec("cd " + JENKINS_PATH, function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		//依次构建各个项目
		buildStaticZt();
		buildStaticProject();
		buildNodePro();
		buildNodeLoc();
		console.log("**************************************************************");
		//退出当前进程
		process.exit();
	})
} else {
	//反斜杠统一替换为正斜杠、去掉字符串中的所有空格、去掉字符串开头和结束的正斜杠
	inputStr = inputStr.replace(/\\/g, "/").replace(/\s/g, "").replace(/^\/+|\/+$/g, "");

	//判断输入的路径是否满足要求
	if (inputStr.indexOf("/") <= -1) {
		console.log("路径中不存在/,请检查路径是否正确");
		process.exit();
	}

	//TODO 该三个变量用的地方比较多，看是否有必要拿到外边
	//截取第一个"\"之后的路径
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
	* 脚本的主干, 需考虑如何进行组织，可将其封装为主函数
	*/
	//更新本地目录、获取trunk分支最新版本
	exec(getPathInfo().drive + ": && cd " + getPathInfo().directory + " && svn update && svn log " + TRUNK_REMOTE + " -l 1 -q", function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		let last_version = /r(\d+)/.exec(stdout)[1];

		revert(urlLocal);

		console.log("trunk分支最新版本：" + last_version);

		let revisions = getMergeInfo(urlBranches, urlTrunk);

		//该步需要在上一步执行完之后再执行
		if (revisions === last_version) {
			console.log("没有需要合并的版本");
		} else {
			console.log("开始执行merge操作！");
			//执行merge操作，并将该操作返回的信息存入 与当前脚本同一目录的output.txt文件
			exec(getPathInfo(TRUNK_LOCAL).drive + ": && cd " + getPathInfo(TRUNK_LOCAL).directory + " && svn merge --accept mc " + urlBranches + " > output.txt", function(error, stdout, stderr) {
				// 如果出现冲突，则终止合并，并revert；否则，进行提交、构建操作
				if (error) {
					//TODO 需测试该操作冲突时具体返回的是什么
					console.log(suffixBranches + "合并出现了冲突！");
					revert();
					console.log("执行完毕，自动有冲突，请手动合并（已回退本地合并内容）!")
					console.log(error.stack);
					process.exit();
				}
				console.log("merge操作结束！");
				commit();
				buildTask(urlTrunk);
			})
		}
		
	})

}


/*
* 获取盘符和路径
* path: 需要操作的目录
*/
function getPathInfo(path) {

	//TODO 需要判断是否合法
	let drive = path.slice(0, 1);
	let directory = path.slice(2);

	return {
		drive : drive,
		directory : directory
	};
}

/*
* 获取被合并的版本信息
* svn mergeinfo http://svn_server/xxx_repository/trunk --show-revs eligible
*/
function getMergeInfo(urlBranches, urlTrunk) {
	let revisions;
	exec(getPathInfo().drive + ": && cd " + getPathInfo().directory + " && svn mergeinfo --show-revs=eligible " + urlBranches + " " + urlTrunk, function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		//stdout为所有需要合并的版本
		revisions = stdout.split("r");
		console.log("branch分支最新版本：" + stdout.split("r")[stdout.split("r").length - 1]);
		//返回branch分支最新版本
		return revisions[revisions.length - 1];
	})
}

/*
* 回退代码处理
*/
function revert(urlLocal) {
	console.log("开始执行revert操作");
	exec(getPathInfo().drive + ": && cd " + getPathInfo().directory + " && svn revert " + urlLocal + " -R", function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		console.log(urlLocal + " 本地回退OK ");
	})
}

/*
* 提交代码处理
*/
function commit() {
	console.log("开始执行commit操作");
	exec(getPathInfo().drive + ": && cd " + getPathInfo().directory + " && svn commit " + urlLocal + " -m merge  " + revisions + "  into trunk from " + suffixBranches, function(error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			process.exit();
		}
		console.log(suffixBranches + "合并成功 OK！");
	})
}

/*
* 构建任务处理
*/
function buildTask(urlTrunk) {
	if (!urlTrunk) return;

	if (urlTrunk.indexOf("static_project") >= 0) {
		console.log("此为纯前端项目");
		buildStaticProject();
	}
	if (urlTrunk.indexOf("static_zt") >= 0) {
		console.log("此为专题");
		buildStaticZt();
	}
	if (urlTrunk.indexOf("node_pro") >= 0) {
		console.log("此为node_pro后端项目");
		buildStaticZt();
	}
	if (urlTrunk.indexOf("node_loc") >= 0) {
		console.log("此为node_loc后端项目");
		buildStaticZt();
	}
}

/*
* 构建静态项目
*/
function buildStaticProject() {
	//TODO 首先进入jenkins.jar所在目录，再执行对应的命令
}

/*
* 构建专题项目
*/
function buildStaticZt() {
	
}

/*
* 构建NodePro项目
*/
function buildNodePro() {
	
}

/*
* 构建NodeLoc项目
*/
function buildNodeLoc() {
	
}

/*
* 重启node服务
*/
function restart() {
	
}
