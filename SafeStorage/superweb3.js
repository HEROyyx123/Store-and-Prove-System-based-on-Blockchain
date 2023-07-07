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
	const contractOwnerAdderss = '0xa2425Af8985AfBBBd7a1fFa707A87D42d1597661';
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
	//获取所有哈希值
	const resultDiv = document.getElementById("result");
	const errNetwork = document.getElementById("error");
	let html = '';
	try {
		const value = await rcontract.getAllHashes();
		const values = value.toString().split(',');
		for (let i = 0; i < values.length; i++) {
			html += `<div>${i + 1}. ${values[i]}</div>`;
			resultDiv.innerHTML = html;

		}
	} catch (err) {
		html = "网络未连接";
		errNetwork.innerHTML = html;
		errNetwork.style.backgroundColor = "red";
		console.log(html);
		console.error(err);
	}


	//单次查询函数
	iverifyHash = async function() {
		//改为选择文件查询是否存在
		//文件转SHA-256算法
		const fileInput = document.getElementById('fileInputVerify');
		fileInput.addEventListener('change', async () => {
			const file = fileInput.files[0];
			const buffer = await file.arrayBuffer();
			const hashBuffer = await crypto.subtle.digest('SHA-256',
				buffer
			); //使用Web Crypto API的方法，返回一个Promise对象，等待异步操作完成后最终解析成一个ArrayBuffer二进制对象 use Node.js
			const hashArray = Array.from(new Uint8Array(hashBuffer)); //二进制转十六进制数组
			const fileHash = '0x' + hashArray.map(b => b.toString(16).padStart(2,
				'0')).join(''); //将哈希值数组转换为哈希值字符串 也就是最终的文件哈希值
			console.log('File hash:', fileHash);
			const hashToVerify = fileHash;
			const result0 = await rcontract.verifyHash(hashToVerify);
			console.log('return', result0);
			document.getElementById("vresult").innerText = result0 ? "该文件已经在区块链上找到" :
				"该文件不存在";
			//将查找到的哈希值在前端中标绿
			//前端校验
			try {
				const value = await rcontract.getAllHashes(); //read
				const values = value.toString().split(',');
				const resultDiv = document.getElementById("Found");
				let found = '';
				for (let i = 0; i < values.length; i++) {
					if (hashToVerify == values[i]) //前端对比非链上
					{
						found =
							`<div>${i + 1}. ${file.name+': '}${values[i]}</div>`;
						resultDiv.innerHTML = found;
						resultDiv.style.backgroundColor = "green";
						alert('已经在区块链上找到：' + file.name + ' 文件');

						break;
					}
					if (hashToVerify != values[i]) {
						found = `<div>${"区块链上不存在该文件哈希"}: ${hashToVerify}</div>`;
						resultDiv.innerHTML = found;
						resultDiv.style.backgroundColor = "red";
						if (i == values.length - 1) {
							alert('区块链上不存在：' + file.name + ' 文件');

						}
					}
				}
			} catch (err) {
				html = "网络未连接";
				errNetwork.innerHTML = html;
				errNetwork.style.backgroundColor = "red";
				console.log(html);
				console.error(err);
			}

		});
	}

	//批量查询函数
	iverifyHashes = async function() {
		const fileInputs = document.getElementById('fileInputSVerify');
		fileInputs.addEventListener('change', async () => {
			const files = fileInputs.files;
			const hashes = [];
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const buffer = await file.arrayBuffer();
				const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
				const hashArray = Array.from(new Uint8Array(hashBuffer));
				const fileHash = '0x' + hashArray.map(b => b.toString(16).padStart(2,
					'0')).join(
					'');
				console.log(`File ${i + 1} hash:`, fileHash);
				hashes.push(fileHash);
			}
			const hashesToVerify = hashes;
			const results = await rcontract.verifyHashes(hashesToVerify);
			console.log(results);
			document.getElementById("results").innerText = results;
			//将查找到的哈希值在前端中标绿			
			//前端校验
			try {
				const value = await rcontract.getAllHashes();
				const values = value.toString().split(',');
				const resultDiv = document.getElementById("Founds");
				let found = '';
				for (let i = 0; i < values.length; i++) {
					for (let j = 0; j < hashesToVerify.length; j++) {
						if (values[i] == hashesToVerify[j]) {
							found +=
								`<div>${i + 1}. ${files[j].name+': '}${values[i]}</div>`;
							resultDiv.innerHTML = found;
							resultDiv.style.backgroundColor = "green";
							break;
						}
						console.log("i:", i);
						console.log("j:", j);
						console.log("filename:", files[j].name);

					}

				}
				console.log("hashesToVerify:", hashesToVerify);

			} catch (err) {
				alert('发生了未知错误');
				html = "发生了未知错误";
				errNetwork.innerHTML = html;
				errNetwork.style.backgroundColor = "red";
				console.log(html);
				console.error(err);
			}
		});
	}



	// 获取上传文件的哈希值 单次存储
	const fileInput = document.getElementById('fileInput');
	fileInput.addEventListener('change', async () => {
		const file = fileInput.files[0];
		const buffer = await file.arrayBuffer();
		const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const fileHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
		console.log('File hash:', fileHash);
		let isntml = '';
		const errupload1 = document.getElementById("errupload1");
		//这里添加前端调用验证函数检查文件存在性避免引发错误交易
		const isStore = await rcontract.verifyHash(fileHash);
		const isOwner = await rcontract.isOwner(userAddress);
		console.log("isOwner:", isOwner);

		try {

			if (isOwner) {
				//权限校验
				if (isStore) {
					console.log("文件已存在无法上传");
					isntml = "文件已存在无法上传";
					errupload1.innerHTML = isntml;
					errupload1.style.backgroundColor = "red";
					alert('文件已存在无法上传');
				} else {
					isntml = '正在上传请稍后...';
					errupload1.innerHTML = isntml;
					errupload1.style.backgroundColor = "";
					try {
						const tx = await contract.methods.addHash(fileHash).send({
							from: userAddress
						});
						// const hash = tx.transactionHash;
						// document.getElementById('errupload1').innerText = `交易已提交，交易哈希值：${hash}`;

						// tx.on('receipt', receipt => {
						// 	document.getElementById('errupload1').innerText =
						// 		`交易已确认，区块哈希值：${receipt.blockHash}`;
						// });

					} catch (err) {
						console.error(err);
						isntml = '拒绝交易';
						errupload1.innerHTML = isntml;
						errupload1.style.backgroundColor = "";
						alert('上传交易已取消');
					}
				}
			} else {
				isntml = '未获得授权';
				errupload1.innerHTML = isntml;
				errupload1.style.backgroundColor = "";
				alert('未获得授权');
			}
		} catch (err) {
			console.error(err);
			isntml = '发生了未知错误';
			errupload1.innerHTML = isntml;
			errupload1.style.backgroundColor = "";
			alert('发生了未知错误');
		}
	});

	//批量存储
	const fileInputs = document.getElementById('fileInputs');
	fileInputs.addEventListener('change', async () => {
		const files = fileInputs.files;
		const hashes = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const buffer = await file.arrayBuffer();
			const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const fileHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join(
				'');
			console.log(`File ${i + 1} hash:`, fileHash);
			hashes.push(fileHash);
		}
		console.log('All Hashes:', hashes);
		let isntml = '';
		const errupload2 = document.getElementById("errupload2");
		//这里校验文件存在性
		let isStore = [];
		let flag = false;
		const isOwner = await rcontract.isOwner(userAddress);
		isStore = await rcontract.verifyHashes(hashes);
		console.log("isStore:", isStore);
		try {
			if (isOwner) {
				for (let i = 0; i < isStore.length; i++) {
					if (isStore[i]) {
						console.log("有文件已存在无法上传");
						isntml = "有文件已存在无法上传";
						errupload2.innerHTML = isntml;
						errupload2.style.backgroundColor = "red";
						flag = true;
						alert('文件已存在无法上传');
						break;
					}
				}
				if (!flag) {
					isntml = '正在上传请稍后...';
					errupload2.innerHTML = isntml;
					errupload2.style.backgroundColor = "";
					try {
						const tx = await contract.methods.addHashes(hashes).send({
							from: userAddress
						});
						// const hash = tx.transactionHash;
						// document.getElementById('errupload2').innerText =
						// 	`批量上传交易已提交，交易哈希值：${hash}`;


						// tx.on('receipt', receipt => {
						// 	document.getElementById('errupload2').innerText =
						// 		`批量上传交易已确认，区块哈希值：${receipt.blockHash}`;
						// 	resolve();
						// });
						

					} catch (err) {
						console.error(err);
						isntml = '拒绝交易';
						errupload2.innerHTML = isntml;
						errupload2.style.backgroundColor = "";
						alert('上传交易已取消');
					}

				}
			} else {
				isntml = '未获得授权';
				errupload2.innerHTML = isntml;
				errupload2.style.backgroundColor = "";
				alert('未获得授权');
			}
		} catch (err) {
			console.error(err);
			isntml = '发生了未知错误';
			errupload2.innerHTML = isntml;
			errupload2.style.backgroundColor = "";
			alert('发生了未知错误');
		}
	});


	//获取区块链交易信息****************未完成
	// getContractEvents = async function() {
	// 	//1.使用web.js的 web3.eth.getTransaction(transactionHash [, callback])但是只能查询指定交易哈希
	// 	//2.使用Etherscan.io的API 这里先使用goerli网络测试
	// 	//web3.js本地浏览器对象方法（准确的话需要连接Infura节点 需要申请）
	// 	// web3 = new Web3("https://goerli.infura.io/v3/abd386d0198648a3b1a4f4fec848e488");
	// 	// const Superweb3 = new Web3("https://goerli.infura.io/v3/abd386d0198648a3b1a4f4fec848e488");
	// 	// const Supercontract = new Superweb3.eth.Contract(contractABI, contractAddress); //write contract use web3.js
	// 	const events = await contract.getPastEvents("allEvents", {
	// 		fromBlock: 0,
	// 		toBlock: 'latest'
	// 	}); //报错block range is too wide
	// 	const transactions = await Promise.all(
	// 		events.map(async (event) => {

	// 			const tx = await web3.eth.getTransaction(event.transactionHash);
	// 			return {
	// 				blockNumber: tx.blockNumber,
	// 				timestamp: (await web3.eth.getBlock(tx.blockNumber)).timestamp,
	// 				from: tx.from,
	// 				to: tx.to,
	// 				value: tx.value,
	// 				gasPrice: tx.gasPrice,
	// 				gasUsed: tx.gasUsed,
	// 				txHash: tx.hash,
	// 				eventType: event.event,
	// 				eventData: event.returnValues,
	// 			};
	// 		})
	// 	);
	// 	console.log("transactions:", transactions);
	// 	return transactions;



	// }

	getContractEvents = async function() {
		// const apiUrl = `https://goerli.infura.io/v3/abd386d0198648a3b1a4f4fec848e488`;
		// const options = {
		// 	address: contractAddress,
		// 	fromBlock: 0,
		// 	toBlock: 'latest',
		// 	topics: []
		// };

		// fetch(
		// 		`${apiUrl}?module=logs&action=getLogs&fromBlock=${options.fromBlock}&toBlock=${options.toBlock}&address=${options.address}&apikey=3FQNI59SAX99QWY1W5SN4SFXKYXNW13P6I`)
		// 	.then(response => response.json())
		// 	.then(data => {
		// 		const transactionsTable = document.getElementById('transactions');

		// 		data.result.forEach(log => {
		// 			const row = document.createElement('tr');

		// 			const hashCell = document.createElement('td');
		// 			hashCell.innerText = log.transactionHash;
		// 			row.appendChild(hashCell);

		// 			const blockNumberCell = document.createElement('td');
		// 			blockNumberCell.innerText = log.blockNumber;
		// 			row.appendChild(blockNumberCell);

		// 			const fromCell = document.createElement('td');
		// 			fromCell.innerText = log.topics[1];
		// 			row.appendChild(fromCell);

		// 			const toCell = document.createElement('td');
		// 			toCell.innerText = log.topics[2];
		// 			row.appendChild(toCell);

		// 			const valueCell = document.createElement('td');
		// 			valueCell.innerText = web3.utils.fromWei(log.data);
		// 			row.appendChild(valueCell);

		// 			const gasPriceCell = document.createElement('td');
		// 			gasPriceCell.innerText = web3.utils.fromWei(log.gasPrice, 'gwei');
		// 			row.appendChild(gasPriceCell);

		// 			const gasUsedCell = document.createElement('td');
		// 			gasUsedCell.innerText = log.gasUsed;
		// 			row.appendChild(gasUsedCell);

		// 			transactionsTable.appendChild(row);
		// 		});
		// 	})
		// 	.catch(error => console.error(error));

	//window.location.href = 'https://api-goerli.etherscan.io/api?module=account&action=txlist&address=0x89aff8f9f85c4f6a98E87Bd9D0ddCb9639cc2385&startblock=0&endblock=99999999apikey=3FQNI59SAX99QWY1W5SN4SFXKYXNW13P6I';
	
	}



});
