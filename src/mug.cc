// mug.cc
// Copyright (c) 2011-2012 Meadhbh S. Hamrick, All Rights Reserved
//
// License info at https://github.com/OhMeadhbh/node-mug/raw/master/LICENSE

#include "mug.h"
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <net/if.h>
#include <unistd.h>
#include <stdio.h>

using namespace v8;

extern "C" void init( Handle<Object> target ) {
  NODE_SET_METHOD( target, "DefaultInterface", mug::DefaultInterface );
  NODE_SET_METHOD( target, "MACAddress", mug::MACAddress );
}

Handle<Value> mug::DefaultInterface( const Arguments & args ) {
  return String::New("eth0");
}

Handle<Value> mug::MACAddress( const Arguments & args ) {
  int sock, len;
  struct ifreq hwaddr;
  Local<String> interface;

  if( ! ( args.Length() == 1 && args[0]->IsString() ) ) {
    return ThrowException( Exception::TypeError( String::New( "Invalid arguments: Expected MACAddress( String )" ) ) );
  }

  memset( &hwaddr, 0, sizeof( hwaddr ) );
  interface = args[0]->ToString();
  len = interface->Length();
  interface->WriteAscii( hwaddr.ifr_name, 0, len, 0 );

  sock = socket( PF_INET, SOCK_DGRAM, 0 );
  ioctl( sock, SIOCGIFHWADDR, &hwaddr );
  close( sock );

  Local<Object> Response = Array::New();

  for( int i = 0; i < 6; i++ ) {
    Response->Set( Number::New( i ), Number::New( (unsigned char) hwaddr.ifr_hwaddr.sa_data[i] ) );
  }

  return( Response );
}
