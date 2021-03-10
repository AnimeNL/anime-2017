<?php
// Copyright 2021 Peter Beverloo. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

declare(strict_types=1);

namespace Anime;

// Implementation of the actual API calls as methods whose input has been validated for syntax, and
// for whom the appropriate environment is already available.
class Api {
    private Configuration $configuration;
    private Environment $environment;

    public function __construct(string $hostname) {
        $this->configuration = Configuration::getInstance();
        $this->environment = Environment::createForHostname($this->configuration, $hostname);

        if (!$this->environment->isValid())
            throw new \Exception('The "' . $hostname . '" is not known as a valid environment.');
    }

    /**
     * Allows an authentication token (authToken) to be obtained for given credentials. The token
     * may have an expiration time, which should be validated on both the client and server-side.
     *
     * @param emailAddress The e-mail address associated to authenticate with.
     * @param accessCode Access code given to the person who owns this e-mail address.
     * @see https://github.com/AnimeNL/volunteer-portal/blob/main/API.md#apiauth
     */
    public function auth(string $emailAddress, string $accessCode) {

    }

    /**
     * Allows information to be obtained for the environment the volunteer portal runs under. This
     * allows multiple events to be managed by the same instance.
     *
     * @see https://github.com/AnimeNL/volunteer-portal/blob/main/API.md#apienvironment
     */
    public function environment(): array {
        $events = [];

        foreach ($this->environment->getEvents() as $event) {
            $events[] = [
                'name'                  => $event->getName(),
                'enableContent'         => $event->enableContent(),
                'enableRegistration'    => $event->enableRegistration(),
                'enableSchedule'        => $event->enableSchedule(),
                'slug'                  => $event->getIdentifier(),  // FIXME
                'timezone'              => $event->getTimezone(),
                'website'               => $event->getWebsite() ?? '',
            ];
        }

        return [
            'contactName'   => $this->environment->getContactName(),
            'contactTarget' => $this->environment->getContactTarget(),
            'events'        => $events,
            'title'         => $this->environment->getTitle(),
        ];
    }

    /**
     * Allows static content to be obtained for the registration sub-application, as well as other
     * pages that can be displayed on the portal. The <App> component is responsible for routing.
     *
     * @see https://github.com/AnimeNL/volunteer-portal/blob/main/API.md#apicontent
     */
    public function content() {
        return [
            'pages' => $this->environment->getContent(),
        ];
    }

    /**
     * Allows information about the authenticated user to be obtained, both for verification of
     * validity of the authentication token, as for appropriate display of their information in
     * the user interface.
     *
     * @param authToken The authentication token that was issued to this user.
     * @see https://github.com/AnimeNL/volunteer-portal/blob/main/API.md#apiuser
     */
    public function user(string $authToken) {

    }
}