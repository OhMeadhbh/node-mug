# node-mug (Meadhbh's UUID Generator)

This package generates RFC 4122 UUIDs, collecting entropy from the
/dev/urandom file.

## Installation

The easiest way to install this package is to use npm:

<pre>    npm install node-mug</pre>

If you want to check out the source, use the git command:

<pre>    git clone git://github.com/OhMeadhbh/node-mug.git</pre>

## Usage

After importing the node-mug package, create a UUID generator with the 
createInstance() function. Since we're actually checking to see if we can open
the /dev/urandom file, we use a callback instead of returning a generator
object.

<pre>    var mug = require('node-mug');
    var UUIDGenerator;

    mug.createInstance( function ( g ) {
        UUIDGenerator = g;
    } );</pre>

If you want to use a file other than /dev/urandom, pass an options object as
the first parameter to the createInstance call:

<pre>    var mug = require('node-mug');
    var UUIDGenerator;

    mug.createInstance( {source: '/dev/random'}, function ( g ) {
        UUIDGenerator = g;
    } );</pre>

Once you have a generator, call the generate() function with a callback to
generate UUIDs. The single parameter to the callback will be a UUID object
that includes toString() and toURI():

<pre>    UUIDGenerator.uuid( function ( uuid ) {
        console.log( uuid.toString() );
        console.log( uuid.toURN() );
     });</pre>

The uuid() call will usually allocate a new buffer to hold the UUID. If you
want to use a pre-allocated buffer, you can pass it as the second parameter
to the uuid() call. UUID buffers must be at least 16 octets.

<pre>    var uuidBuffer = new Buffer( 16 );

    UUIDGenerator.uuid( function ( uuid ) {
        console.log( uuid.toString() );
        console.log( uuid.toURN() );
     }, uuidBuffer );</pre>

So, putting it all together, here's a program that generates 10 UUIDs:

<pre>    var mug = require('node-mug');

    var generatorCallback = function ( uuid ) {
        console.log( uuid.toString() );
    };

    var createCallback = function( g ) {
        for( i = 0; i < 10; i++ ) {
            g.generate( generatorCallback );
        }
    };

    mug.createInstance( createCallback );</pre>

## Testing

There is an expresso-based test and a non expresso based test. Before
running either, cd into the test directory. For the expresso test, use
the command:

<pre>    expresso testMug.js</pre>

For the non-expresso test, use this command:

<pre>    node nonExpressoTest.js</pre>
