// nonExpressoTest.js
// Copyright (c) 2011 Meadhbh S. Hamrick, All Rights Reserved
//
// License info at https://raw.github.com/OhMeadhbh/node-mug/master/LICENSE

console.log( '%MUGT-I-START; Starting UUID Generator Test.' );

// This file implements a series of unit tests for the UUID Generator, but not
// in an expresso environment. As much as I love expresso, I can't seem to get
// it to work with the Cloud9 IDE yet.

console.log( '%MUGT-I-REQUIRE; Calling require("node-mug").' );

var mug    = require('../node-mug');
var assert = require('assert');

// First, let's check that the require worked. We're in deep yoghurt if requires
// stop working. First, let's look at the mug object (the thing exported from
// the node-mug module and imported by the require statement.) Public members
// of the object include the IDs for the different kind of UUIDs we can
// generate: TIME, RANDOM, MD5 and SHA1. There's also the null UUID and the
// createInstance method.

assert.equal( 'object', typeof( mug ) );
assert.equal( 'number', typeof( mug.TIME ) );
assert.equal( 1, mug.TIME );
assert.equal( 'number', typeof( mug.RANDOM ) );
assert.equal( 4, mug.RANDOM );
assert.equal( 'number', typeof( mug.MD5 ) );
assert.equal( 3, mug.MD5 );
assert.equal( 'number', typeof( mug.SHA1 ) );
assert.equal( 5, mug.SHA1 );
assert.equal( 'object', typeof( mug.NullUUID ) );
assert.equal( 'function', typeof( mug.createInstance ) );

console.log( '%MUGT-I-NULL; Testing Null UUID' );
var nullUUID = mug.NullUUID;

assert.equal( 'urn:uuid:00000000-0000-0000-0000-000000000000', nullUUID.toURN() );

// Now let's use the createInstance() function to create a few different kinds
// of UUID generators

var timeUUID;
var randomUUID;
var md5UUID;
var sha1UUID;

// If you don't provide an options object or don't set the 'version' member of
// the options object you do provide, the default is to create a RANDOM uuid
// generator.

console.log( '%MUGT-I-RANDOM; Testing Random UUID functions' );

function testRandomGenerator( g, source ) {
    assert.equal( 'object', typeof( g ) );
    assert.equal( 'object', typeof( g.options ) );
    assert.equal( 'string', typeof( g.options.source ) );
    assert.equal( source, g.options.source );
    assert.equal( 'number', typeof( g.options.version ) );
    assert.equal( mug.RANDOM, g.options.version );
};

var defaultGeneratorCallback = function ( g ) {

    testRandomGenerator( g, '/dev/urandom' );
    
    var randomTestCallback = function ( uuid ) {
        assert.equal( 'object', typeof( uuid ) );
        
        var uuidString = uuid.toString();
        assert.equal( 'string', typeof( uuidString ) );
        assert.equal( '4', uuidString.substr(14,1) );
    };
    
    g.generate( randomTestCallback );
};

// These three statements should all produce the same results.
mug.createInstance( defaultGeneratorCallback );
mug.createInstance( {}, defaultGeneratorCallback );
mug.createInstance( {version: mug.RANDOM}, defaultGeneratorCallback );

// Now let's make sure we can use non-standard entropy sources
console.log( '%MUGT-I-NONSTANDARD; Testing non-standard source for random uuids' );

var count = 0;
var uuids = {};
var uuidFixtures = [
                    'e0244b5c-41dc-45fa-a114-40c95d72eba7',
                    'b4e5d92a-9216-4afa-b862-b3f156af8804',
                    'f39f1baa-8633-44b6-a891-80799f002f79',
                    'c9d0c50a-d25b-41f9-8545-b5f60d2b9a66',
                    'cbfc2c18-2aa9-49f2-bb8b-16cd2980b1da',
                    '57b0a436-65f2-4f82-a0a1-d70ae46281bb',
                    '426a2b4a-6a8b-4390-8293-c9ebc4fae846',
                    '902beed8-ebe9-4f65-bfa5-2906cdf6c89c',
                    'bc272954-0ec3-4cb6-b7f6-ea1691783361',
                    'dd270ec1-91dc-467e-a6fc-e1e71ec2ba8c'
                    ];

var nonstandardTestCallback = function ( uuid ) {
    var key = uuid.toString();
    uuids[ key ] = uuid;
    count++;

    if( 10 == count ) {
        var uuidKeys = Object.keys( uuids );
        for( var i = 0, il = uuidKeys.length; i < il; i++ ) {
            var currentKey  = uuidKeys[ i ];
            var currentUUID = uuids[ currentKey ];
            assert.equal( currentKey, currentUUID.toString() );
        }
    }
};

var nonstandardGenerateCallback = function( g ) {
    // generate 10 UUID objects
    for( i = 0; i < 10; i++ ) {
        g.generate( nonstandardTestCallback );
    }
};

mug.createInstance( {source:'entropy.bin'}, nonstandardGenerateCallback );

