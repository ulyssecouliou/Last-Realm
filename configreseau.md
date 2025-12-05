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
    interface fa0/2
        switchport mode access
        switchport access vlan 20
    interface fa0/3
        switchport mode access
        switchport access vlan 30

    interface fa0/24
        switchport trunk encapsulation dot1q
        switchport mode trunk

Sur Router1:
    en
    conf t
    int fa0/0.10
        encapsulation dot1Q 10
        ip address 192.168.0.1 255.255.255.192
    interface g0/0.20
        encapsulation dot1Q 20
        ip address 192.168.0.65 255.255.255.192
    interface g0/0.30
        encapsulation dot1Q 30
        ip address 192.168.0.129 255.255.255.192


