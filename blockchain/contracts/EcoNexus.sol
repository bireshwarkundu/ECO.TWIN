// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoNexus is ERC721URIStorage, Ownable {
    // Counter for Token IDs 
    uint256 private _nextTokenId;
    
    // Rewards Balance: User Address -> ECO Amount
    mapping(address => uint256) public ecoBalance;
    
    // User History: User Address -> Array of their Token IDs
    mapping(address => uint256[]) public userContributions; 

    event DataMinted(
        uint256 indexed tokenId, 
        address indexed miner, 
        string tokenURI, 
        uint256 reward
    );

    constructor() ERC721("EcoPulse Data", "PULSE") Ownable() {}

    function submitData(
        address _user,  
        string memory _tokenURI
    ) 
        public 
        onlyOwner 
        returns (uint256) 
    {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _mint(_user, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        ecoBalance[_user] += 10;

        userContributions[_user].push(tokenId);

        emit DataMinted(tokenId, _user, _tokenURI, 10);

        return tokenId;
    }


    function getUserTokenIds(address _user) public view returns (uint256[] memory) {
        return userContributions[_user];
    }

    function getTotalMinted() public view returns (uint256) {
        return _nextTokenId;
    }

    function getBalance(address _user) public view returns (uint256) {
        return ecoBalance[_user];
    }
}