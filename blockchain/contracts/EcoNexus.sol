// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EcoNexus is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // 1. STATE VARIABLES
    mapping(address => uint256) public ecoBalance;
    mapping(address => uint256) public lastMintTime;
    
    // The "Tunable" Cooldown (Starts at 60 seconds)
    uint256 public cooldownPeriod = 60; 

    // The Boss (You)
    address public owner;

    // 2. EVENTS
    event DataMinted(uint256 indexed tokenId, address indexed miner, int256 lat, int256 lon, uint256 aqi, string ipfsHash);
    event CooldownChanged(uint256 newTime);

    // 3. MODIFIER (Security)
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the Owner can do this!");
        _;
    }

    constructor() ERC721("EcoPulse Data", "PULSE") {
        owner = msg.sender; // You become the owner when you deploy
    }

    // 4. THE GOVERNANCE FUNCTION (Change time in future)
    // Pass time in seconds (e.g., 3600 for 1 hour)
    function setCooldown(uint256 _newSeconds) public onlyOwner {
        cooldownPeriod = _newSeconds;
        emit CooldownChanged(_newSeconds);
    }

    // 5. THE MAIN FUNCTION
    function submitData(int256 _lat, int256 _lon, uint256 _aqi, string memory _tokenURI) 
        public 
        returns (uint256)
    {
        // Check the dynamic cooldown
        require(block.timestamp >= lastMintTime[msg.sender] + cooldownPeriod, "Cooldown active: Please wait!");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        ecoBalance[msg.sender] += 10;
        lastMintTime[msg.sender] = block.timestamp;

        emit DataMinted(newItemId, msg.sender, _lat, _lon, _aqi, _tokenURI);

        return newItemId;
    }
    
    // Helper for Frontend
    function getTimeUntilNextMint(address _user) public view returns (uint256) {
        if (block.timestamp >= lastMintTime[_user] + cooldownPeriod) {
            return 0;
        } else {
            return (lastMintTime[_user] + cooldownPeriod) - block.timestamp;
        }
    }
}