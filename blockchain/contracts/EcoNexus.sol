// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoNexus is ERC721URIStorage, Ownable {
    // Counter for Token IDs (starts at 0)
    uint256 private _nextTokenId;

    // --- 1. STATE VARIABLES ---
    
    // Rewards Balance: User Address -> ECO Amount
    mapping(address => uint256) public ecoBalance;
    
    // User History: User Address -> Array of their Token IDs
    mapping(address => uint256[]) public userContributions; 

    // --- 2. EVENTS ---
    // FIXED: Removed lat, lon, and aqi. Only tracking ID, User, URI, and Reward.
    event DataMinted(
        uint256 indexed tokenId, 
        address indexed miner, 
        string tokenURI, 
        uint256 reward
    );

    // Constructor
    constructor() ERC721("EcoPulse Data", "PULSE") Ownable() {}

    // --- 3. CORE FUNCTION: MINTING ---
    // FIXED: Removed lat, lon, aqi arguments.
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

        // A. Mint the NFT to the user
        _mint(_user, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // B. Add Rewards (10 ECO per mint)
        ecoBalance[_user] += 10;

        // C. Record this ID in the user's personal list
        userContributions[_user].push(tokenId);

        // D. Emit Event (Simplified)
        emit DataMinted(tokenId, _user, _tokenURI, 10);

        return tokenId;
    }

    // --- 4. VIEW FUNCTIONS ---

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