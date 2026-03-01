// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EcoNexus is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // 1. STATE VARIABLES
    mapping(address => uint256) public ecoBalance;
    // Removed lastMintTime mapping
    
    // Removed cooldownPeriod variable

    // The Boss (You)
    address public owner;

    // 2. EVENTS
    event DataMinted(uint256 indexed tokenId, address indexed miner, int256 lat, int256 lon, uint256 aqi, string ipfsHash);
    // Removed CooldownChanged event

    // 3. MODIFIER (Security)
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the Owner can do this!");
        _;
    }

    constructor() ERC721("EcoPulse Data", "PULSE") {
        owner = msg.sender; // You become the owner when you deploy
    }

    // 4. REMOVED: setCooldown function

    // 5. THE MAIN FUNCTION - UPDATED (cooldown removed)
    function submitData(
        address _user,
        int256 _lat, 
        int256 _lon, 
        uint256 _aqi, 
        string memory _tokenURI
    ) 
        public 
        onlyOwner
        returns (uint256)
    {
        // REMOVED: Cooldown check

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        // Mint NFT to the USER
        _mint(_user, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        // Add ECO to USER's balance
        ecoBalance[_user] += 10;
        
        // REMOVED: lastMintTime update

        emit DataMinted(newItemId, _user, _lat, _lon, _aqi, _tokenURI);

        return newItemId;
    }
    
    // REMOVED: getTimeUntilNextMint function
}