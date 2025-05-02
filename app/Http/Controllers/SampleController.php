<?php

namespace App\Http\Controllers;

use App\Http\Requests\EchoRequest;

class SampleController
{
    public function version()
    {
        return response()
            ->json(
                [
                    'version' => app()->version(),
                ]
            );
    }

    public function echo(EchoRequest $request)
    {
        return response()
            ->json(
                [
                    'data' => $request->validated('data'),
                ]
            );
    }
}
