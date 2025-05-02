<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleFeatureTest extends TestCase
{
    public function test_version(): void
    {
        $response = $this->getJson(
            '/api/version'
        );

        $response->assertOk();
        $response->assertJson(
            [
                'version' => '11.33.2'
            ]
        );
    }

    public function test_echo_returns_sent_data(): void
    {
        $response = $this->postJson(
            '/api/echo',
            [
                'data' => [
                    'foo' => 'bar'
                ]
            ]
        );

        $response->assertStatus(200);
        $response->assertJson(
            [
                'data' => [
                    'foo' => 'bar'
                ]
            ]
        );
    }
}
