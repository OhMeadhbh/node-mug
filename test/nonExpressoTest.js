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
    assert.equal( 'undefined', typeof( g.options.source ) );
    assert.equal( 'number', typeof( g.options.version ) );
    assert.equal( mug.RANDOM, g.options.version );
}

var defaultGeneratorCallback = function ( g ) {

    testRandomGenerator( g, null );
    
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
var fixtures = [
                    { expected: 'e0244b5c-41dc-45fa-a114-40c95d72eba7' }
                    , { expected: 'b4e5d92a-9216-4afa-b862-b3f156af8804' }
                    , { expected: 'f39f1baa-8633-44b6-a891-80799f002f79' }
                    , { expected: 'c9d0c50a-d25b-41f9-8545-b5f60d2b9a66' }
                    , { expected: 'cbfc2c18-2aa9-49f2-bb8b-16cd2980b1da' }
                    , { expected: '57b0a436-65f2-4f82-a0a1-d70ae46281bb' }
                    , { expected: '426a2b4a-6a8b-4390-8293-c9ebc4fae846' }
                    , { expected: '902beed8-ebe9-4f65-bfa5-2906cdf6c89c' }
                    , { expected: 'bc272954-0ec3-4cb6-b7f6-ea1691783361' }
                    , { expected: 'dd270ec1-91dc-467e-a6fc-e1e71ec2ba8c' }
                ];

var nonstandardTestCallback = function ( uuid ) {
    count++;
    if( 10 == fixtures.length ) {
        for( var i = 0, il = fixtures.length; i < il; i++ ) {
            var testThis = new mug.uuid( fixtures[i].buffer );
            testThis.makeRandom();
            assert.equal( testThis.toString(), fixtures[i].expected );
        }
    }
};

var nonstandardGenerateCallback = function( g ) {
    // generate 10 UUID objects
    for( i = 0, il = fixtures.length ; i < il; i++ ) {
        fixtures[i].buffer = new Buffer(16);
        g.generate( nonstandardTestCallback, null, fixtures[i].buffer );
    }
};

mug.createInstance( {source:'test/entropy.bin'}, nonstandardGenerateCallback );

// Now let's test the "name based" UUID generators. These generators take
// some input, hash it and then coerce it into a UUID object.

// Let's start with MD5.

console.log( "%MUGT-I-MD5; Testing MD5 (name based) UUID generation." );

var md5GeneratorCallback = function ( g ) {

    // Test that the generator was properly instantiated
    assert.equal( 'object', typeof( g ) );
    assert.equal( 'object', typeof( g.options ) );
    assert.equal( 'number', typeof( g.options.version ) );
    assert.equal( mug.MD5, g.options.version );
    
    // Here are some fixtures (from section A.5 of RFC1321
    var fixtures = [
        {
            input: ''
            , expected: 'd41d8cd9-8f00-3204-a980-0998ecf8427e'
        }
        , {
            input: 'a'
            , expected: '0cc175b9-c0f1-36a8-b1c3-99e269772661'
        }
        , {
            input: 'abc'
            , expected: '90015098-3cd2-3fb0-9696-3f7d28e17f72'
        }
        , {
            input: 'message digest'
            , expected: 'f96b697d-7cb7-338d-925a-2f31aaf161d0'
        }
        , {
            input: 'abcdefghijklmnopqrstuvwxyz'
            , expected: 'c3fcd3d7-6192-3400-bdfb-496cca67e13b'
        }
        , {
            input: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            , expected: 'd174ab98-d277-39f5-a561-1c2c9f419d9f'
        }
        , {
            input: '12345678901234567890123456789012345678901234567890123456789012345678901234567890'
            , expected: '57edf4a2-2be3-3955-ac49-da2e2107b67a'
        }
    ];
    
    for( var i = 0, il = fixtures.length; i < il; i++ ) {
        g.generate( function( uuid ) {
            assert.equal( fixtures[i].expected, uuid.toString() );
            }, fixtures[i].input );
    }

};

mug.createInstance( {version: mug.MD5}, md5GeneratorCallback );

// Now let's test the SHA1 uuid generation option.

console.log( "%MUGT-I-SHA1; Testing SHA1 (name based) UUID generation." );

var sha1GeneratorCallback = function ( g ) {
    // Test that the generator was properly instantiated

    assert.equal( 'object', typeof( g ) );
    assert.equal( 'object', typeof( g.options ) );
    assert.equal( 'number', typeof( g.options.version ) );
    assert.equal( mug.SHA1, g.options.version );
    
    // Here are some fixtures (from appendix A of FIPS-180-2)
    var fixtures = [
        {
            input: 'abc'
            , expected: 'a9993e36-4706-516a-ba3e-25717850c26c'
        }
        , {
            input: 'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'
            , expected: '84983e44-1c3b-526e-baae-4aa1f95129e5'
        } 
    ];
    
    for( var i = 0, il = fixtures.length; i < il; i++ ) {
        g.generate( function( uuid ) {
            assert.equal( fixtures[i].expected, uuid.toString() );
            }, fixtures[i].input );
    }
};

mug.createInstance( {version: mug.SHA1}, sha1GeneratorCallback );

// Time based UUIDs aren't supported at this moment. But if they were, this
// is how you would use them.

var timeGeneratorCallback = function ( g ) {
    // Test that the generator was properly instantiated

    assert.equal( 'object', typeof( g ) );
    assert.equal( 'object', typeof( g.options ) );
    assert.equal( 'number', typeof( g.options.version ) );
    assert.equal( mug.TIME, g.options.version );
    
};

console.log( "%MUGT-E-TIME; Deferring time-based UUID generation." );

mug.createInstance( {version: mug.TIME}, timeGeneratorCallback );

console.log( "%MUGT-I-END; Ending UUID Generator Test." );