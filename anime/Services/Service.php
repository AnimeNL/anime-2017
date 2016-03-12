<?php
// Copyright 2016 Peter Beverloo. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

declare(strict_types=1);

namespace Anime\Services;

// Interface that must be implemented by services given to the ServiceManager.
interface Service {
    // Returns a textual identifier unique to this service. Should be URL safe.
    public function getIdentifier() : string;

    // Returns the frequency, in minutes, at which this service should be executed.
    public function getFrequencyMinutes() : int;

    // Executes the service. Returns whether the service was executed successfully.
    public function execute() : bool;
}
