// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

contract AAAErrors {
    error NotAdmin();
    error AlreadyAdmin();
    error CannotRemoveSelf();
    error AgentDoesntExist();
    error AdminDoesntExist();
    error AdminAlreadyExists();
    error AgentAlreadyExists();

    error DropInvalid();

    error OnlyMarketplaceContract();
    error ZeroAddress();
    error InvalidAmount();
    error NotArtist();
    error CantDeleteSoldCollection();


    error NotAvailable();
    error TokenNotAccepted();
    error PaymentFailed();
}

