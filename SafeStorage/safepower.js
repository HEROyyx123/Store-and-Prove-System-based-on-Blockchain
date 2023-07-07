window.addEventListener('load', async () => { //事件监听器 当浏览器load事件注册回调函数加载完毕后触发
	if (window.ethereum) { //与当前浏览器环境中的已连接网络有关，不识别不同EVM区块链环境
		window.web3 = new Web3(window.ethereum); //新版web3对象 默认使用新版，遵循EIP-1559规范，燃料费用合理稳定
		//await window.ethereum.enable(); //等待请求用户授权 未来可能弃用*
		await window.ethereum.send('eth_requestAccounts') //新版方法1如果有bug用上一句*
	} else if (window.web3) {
		window.web3 = new Web3(window.web3.currentProvider); //旧版web3对象 一般不用
	} else {
		alert(
			'请安装MetaMask插件并连接到Goerli 以太坊网络，配置信息如下：RPC URL为https://goerli.infura.io/v3/，链ID为5，区块链浏览器为https://goerli.etherscan.io，货币符号为GoerliETH'
		);
		return;

		//用infura.io节点供应商的web对象 以太坊主网API配置及API KEY：https://mainnet.infura.io/v3/abd386d0198648a3b1a4f4fec848e488
	}
	// 获取用户地址和授权
	const accounts = await web3.eth.getAccounts();
	const userAddress = accounts[0]; //0xa2425Af8985AfBBBd7a1fFa707A87D42d1597661


	// 获取智能合约实例
	const contractAddress = '0x89aff8f9f85c4f6a98E87Bd9D0ddCb9639cc2385';
	const contractABI = [{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	}, {
		"inputs": [{
			"internalType": "address",
			"name": "_address",
			"type": "address"
		}],
		"name": "addAuthorized",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}, {
		"inputs": [{
			"internalType": "bytes32",
			"name": "_hash",
			"type": "bytes32"
		}],
		"name": "addHash",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}, {
		"inputs": [{
			"internalType": "bytes32[]",
			"name": "_hashes",
			"type": "bytes32[]"
		}],
		"name": "addHashes",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}, {
		"inputs": [],
		"name": "getAllHashes",
		"outputs": [{
			"internalType": "bytes32[]",
			"name": "",
			"type": "bytes32[]"
		}],
		"stateMutability": "view",
		"type": "function"
	}, {
		"inputs": [{
			"internalType": "address",
			"name": "_address",
			"type": "address"
		}],
		"name": "isOwner",
		"outputs": [{
			"internalType": "bool",
			"name": "",
			"type": "bool"
		}],
		"stateMutability": "view",
		"type": "function"
	}, {
		"inputs": [],
		"name": "owner",
		"outputs": [{
			"internalType": "address",
			"name": "",
			"type": "address"
		}],
		"stateMutability": "view",
		"type": "function"
	}, {
		"inputs": [{
			"internalType": "address",
			"name": "_address",
			"type": "address"
		}],
		"name": "removeAuthorized",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}, {
		"inputs": [],
		"name": "safe_destroy",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}, {
		"inputs": [{
			"internalType": "bytes32",
			"name": "hashToVerify",
			"type": "bytes32"
		}],
		"name": "verifyHash",
		"outputs": [{
			"internalType": "bool",
			"name": "",
			"type": "bool"
		}],
		"stateMutability": "view",
		"type": "function"
	}, {
		"inputs": [{
			"internalType": "bytes32[]",
			"name": "hashesToVerify",
			"type": "bytes32[]"
		}],
		"name": "verifyHashes",
		"outputs": [{
			"internalType": "bool[]",
			"name": "",
			"type": "bool[]"
		}],
		"stateMutability": "view",
		"type": "function"
	}];
	const contract = new web3.eth.Contract(contractABI, contractAddress); //write contract use web3.js
	const provider = new ethers.providers.Web3Provider(window.ethereum); //ethers.js Web3Provider子类 
	const rcontract = new ethers.Contract(contractAddress, contractABI,
		provider); //read contract use ethers.js	
	safeAddAuthorized = async function() {
		const user = document.getElementById("addrinput").value;
		try {
			const tx = await contract.methods.addAuthorized(user).send({
				from: userAddress
			});
			// const hash = tx.transactionHash;
			// document.getElementById('uploadProgress').innerText = `交易已提交，交易哈希值：${hash}`;

			// tx.on('receipt', receipt => {
			// 	document.getElementById('uploadProgress').innerText =
			// 		`交易已确认，区块哈希值：${receipt.blockHash}`;
			// });
			alert("申请权限完成");
		} catch (err) {
			console.error(err);
			alert("申请权限失败");
		}
	}

	safeRemoveAuthorized = async function() {
		const user = document.getElementById("addrinput2").value;
		try {
			const tx = await contract.methods.removeAuthorized(user).send({
				from: userAddress
			});
			// const hash = tx.transactionHash;
			// document.getElementById('uploadProgress').innerText = `交易已提交，交易哈希值：${hash}`;

			// tx.on('receipt', receipt => {
			// 	document.getElementById('uploadProgress').innerText =
			// 		`交易已确认，区块哈希值：${receipt.blockHash}`;
			// });
			// alert("撤销权限完成");
		} catch (err) {
			console.error(err);
			alert("撤销权限失败");
		}
	}
	safeIsOwner = async function() {
		// const user = document.getElementById("isOwner").value;
		const ownerdiv = document.getElementById("ownerdiv");
		const isOwner = await rcontract.isOwner(userAddress);
		let html = '';
		if(isOwner)
		{
			html = "拥有权限";
			ownerdiv.innerHTML = html;
			alert("拥有权限，可以上传文件到区块链");
		}
		else
		{
			html = "未获取权限";
			ownerdiv.innerHTML = html;
			alert("未获取权限");
		}
	}
});
