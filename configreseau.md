Sur SW1:
    enable
    conf t

    vlan 10
        name WEB
    vlan 20 
        name BDD
    vlan 30
        name CLIENTS
    interface fa0/1
        switchport mode access
        switchport access vlan 10
        no shutdown
    interface fa0/2
        switchport mode access
        switchport access vlan 20
        no shutdown
    interface fa0/3
        switchport mode access
        switchport access vlan 30

    interface fa0/24
        switchport mode trunk
        switchport trunk allowed vlan 10,20,30
        no shutdown
    interface range fa0/3 - 23
        switchport mode access
        switchport access vlan 30
        no shutdown
    do sw
    do copy running-config startup-config
    

Sur Router1:
    en
    conf t
    int fa0/0
        no sh
    int fa0/0.10
        encapsulation dot1Q 10
        ip address 192.168.0.1 255.255.255.192
    interface fa0/0.20
        encapsulation dot1Q 20
        ip address 192.168.0.65 255.255.255.192
    interface fa0/0.30
        encapsulation dot1Q 30
        ip address 192.168.0.129 255.255.255.192
    
    ip dhcp excluded-address 192.168.0.1 192.168.0.9
    ip dhcp excluded-address 192.168.0.65 192.168.0.69
    ip dhcp excluded-address 192.168.0.129 192.168.0.139

    ip dhcp pool VLAN10
        network 192.168.0.0 255.255.255.192
        default-router 192.168.0.1

    ip dhcp pool VLAN20
        network 192.168.0.64 255.255.255.192
        default-router 192.168.0.65

    ip dhcp pool VLAN30
        network 192.168.0.128 255.255.255.192
        default-router 192.168.0.129
    do sw
    do copy running-config startup-config


