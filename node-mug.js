// node-mug.js
// Copyright (c) 2011 Meadhbh S. Hamrick, All Rights Reserved
//
// License info at https://github.com/OhMeadhbh/node-mug/raw/master/LICENSE

// This file creates RFC 4122 Version 4 (random) UUIDs using /dev/urandom
// as an entropy source.

(function() {
    var fs = require('fs');
    var hexString = "0123456789abcdef";
    var mug = {};

    if( module && module.exports ) {
        module.exports = mug;
    }

    function uuid ( buffer ) {
        this.buffer = buffer;
    }

    uuid.prototype.makeRandom = function () {
        this.buffer[ 8 ] = ( this.buffer[ 8 ] & 0x3F ) | 0x80;
        this.buffer[ 6 ] = ( this.buffer[ 6 ] & 0x0F ) | 0x40;
    };

    uuid.prototype.toString = function () {
        var rv;
        if( this.string ) {
            rv = this.string;
        } else {
            rv = "";
            for( var i = 0; i < 16; i++ ) {
                var j = this.buffer[i];
                rv += hexString.substr( ( j >> 4 ) & 0x0F, 1);
                rv += hexString.substr( j & 0x0F, 1 );
                if( ( i == 3 ) || ( i == 5 ) || ( i == 7 ) || ( i == 9 ) ) {
                    rv += '-';
                }
            }
            this.string = rv;
        }
        return( rv );
    };

    uuid.prototype.toURN = function () {
        if( ! this.urn ) {
            this.urn = 'urn:uuid:' + this.toString();
        }
        return( this.urn );
    };

    function generator ( options, fd ) {
        this.options = options;
        this.fd = fd;
    }

    generator.prototype.generate = function ( callback ) {
        var buffer = new Buffer(16);
        var bytesReadTotal = 0;
        
        var readCallback = function ( err, bytesRead, buf ) {
            if( err ) {
                throw( "error generating UUID: " + err );
            } else {
                bytesReadTotal += bytesRead;
                if( bytesReadTotal < 16 ) {
                    fs.read( this.fd,  buffer, bytesReadTotal,
                             16 - bytesReadTotal, null, readCallback );
                } else {
                    var u = new uuid( buffer );
                    u.makeRandom();
                    callback && callback( u );
                }
            }
        };

        fs.read( this.fd, buffer, 0, 16, null, readCallback );
    };

    generator.prototype.nullUUID = function () {
        var buffer = new Buffer(16);
        for( var i = 0; i < 16; i++ ) {
            buffer[i] = 0;
        }
        return( new uuid( buffer ) );
    };

    mug.createInstance = function ( options, callback ) {
        var source;
        
        if( 'function' == typeof( options ) ) {
            callback = options;
            options = {};
        }

        if( options && options.source ) {
            source = options.source;
        } else {
            source = '/dev/urandom';
        }

        var openCallback = function ( err, fd ) {
            if( !err && callback ) {
                callback( new generator( {source: source}, fd ) );
            } else {
                if( fd ) {
                    fs.close(fd);
                }
                throw( err );
            }
        };

        fs.open( source, 'r', 0666, openCallback );
    };
}());