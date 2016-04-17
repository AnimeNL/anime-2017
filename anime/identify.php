<?php
// Copyright 2016 Peter Beverloo. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

require __DIR__ . '/../vendor/autoload.php';

function dieWithError($error) {
    die(json_encode([ 'error' => $error ]));
}

$environment = \Anime\Environment::createForHostname($_SERVER['HTTP_HOST']);
if (!$environment->isValid())
    dieWithError('Unrecognized volunteer portal environment.');

$volunteers = $environment->loadVolunteers();
if (!($volunteers instanceof \Anime\VolunteerList))
    dieWithError('There are no known volunteers.');

$requestName = file_get_contents('php://input');

$volunteer = $volunteers->findByName($requestName, true /* fuzzy */);
if (!($volunteer instanceof \Anime\Volunteer))
    dieWithError('Your name has not been recognized.');

$userInfo = [
    'name'  => $volunteer->getName(),
    'token' => $volunteer->getToken()
];

die(json_encode($userInfo));
