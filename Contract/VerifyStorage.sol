pragma solidity ^0.8.0;
/*
  权限认证存储证明
  映射版本
  @author yyx
  @since 2023-4-20
 */

contract VerifyStorage {
    mapping(bytes32 => bool) private hashExists;
    bytes32[] private hashes;
    mapping(address => bool) private authorized;
    address public owner;

    modifier onlyAuthorized() { // 仅授权地址可调用
        require(authorized[msg.sender], "Unauthorized");
        _;
    }

    modifier onlyOwner() { // 仅合约创建者可调用
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorized[msg.sender] = true;
    }

    function addHash(bytes32 _hash) public onlyAuthorized {
        require(!hashExists[_hash], "Hash already exists");
        hashes.push(_hash);
        hashExists[_hash] = true;
    }

    function addHashes(bytes32[] memory _hashes) public onlyAuthorized {
        for (uint256 i = 0; i < _hashes.length; i++) {
            require(!hashExists[_hashes[i]], "Hash already exists");
            hashes.push(_hashes[i]);
            hashExists[_hashes[i]] = true;
        }
    }

    function getAllHashes() public view returns (bytes32[] memory) {
        return hashes;
    }

    function verifyHash(bytes32 hashToVerify) public view returns (bool) {
        return hashExists[hashToVerify];
    }

    function verifyHashes(bytes32[] memory hashesToVerify)
        public
        view
        returns (bool[] memory)
    {
        bool[] memory results = new bool[](hashesToVerify.length);

        for (uint256 i = 0; i < hashesToVerify.length; i++) {
            results[i] = hashExists[hashesToVerify[i]];
        }

        return results;
    }

    function addAuthorized(address _address) public onlyOwner {
        authorized[_address] = true;
    }

    function removeAuthorized(address _address) public onlyOwner {
        authorized[_address] = false;
    }

    function isOwner(address _address) public view returns (bool) {
        return authorized[_address];
    }

    function safe_destroy() public onlyOwner {  //自毁函数
        selfdestruct(payable(owner)); 
    }
}