import React from 'react';
import { useState, useContext } from 'react';
import { AuthContext } from '../navigation/AuthProvider';
import { StyleSheet, Text, View, FlatList, Image, ScrollView, TouchableOpacity, Alert,ActivityIndicator } from 'react-native';
import Firebase from "../firebaseConfig";
import Toast from 'react-native-simple-toast'
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function WishList(props) {

    const { user } = useContext(AuthContext);

    console.log("props", props);
    const [listen, setListen] = useState(true);
    const [items, setItem] = useState([]);
    const [cartItems, setCart] = useState([]);
    const [loader,setLoader]=useState(true);

    Firebase.database().ref(`Customers/${user.uid}`).on('value', (data) => {
        if (listen) {
            if (data.val().wishlist) {
                var temp = [];
                var keys = Object.keys(data.val().wishlist);
                
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i]
                    temp.push(data.val().wishlist[key])
                }
                setItem(temp);
            }
            if (data.val().cart) {
                setCart(data.val().cart);
            }else {
                setCart([]);
            }
            setListen(false);
            setLoader(false);
        }

    })
    const itemsPress = (item) => {
        console.log("clicked");
        props.navigation.navigate('ProductDetailsScreen', { item: item });

    }

    function DeleteItem(index) {
        console.log("deleted", index);
        const newArray = items;
        newArray.splice(index, 1);
        setItem(newArray);
        Firebase.database().ref(`Customers/${user.uid}/wishlist`).set(newArray).then(() => {
            Toast.show("Removed from Wishlist", Toast.SHORT);
            setListen(true);
        })

    }
    const addToCart = (item) => {
        var list = [...cartItems];
        var present = false;
        console.log("Cart Items",list);

        for (var i = 0; i < list.length; i++) {
            if (list[i].key == item.key) {
                present = true;
                break;
            }
        }
        if (present) {
            Toast.show("Already added !! ", Toast.SHORT);
        } else {
            list.push(item);
            var items = [...items];
            items.splice(items.indexOf(item),1);
            setItem(items);
            Firebase.database().ref(`Customers/${user.uid}/wishlist`).set(items).then(() => {
            })
            Firebase.database().ref(`Customers/${user.uid}/cart`).set(list).then(() => {
                setListen(true);
                Toast.show("Moved to Cart", Toast.SHORT);
            })
        }

    }

    return (
        <ScrollView>
            <View style={styles.main}>

                <FlatList style={{ flex: 1, padding: 4 }}
                    data={items}
                    numColumns={2}
                    renderItem={({ item }) => (

                        <View style={{ flex: 1, margin: 2 }}>
                            <TouchableOpacity onPress={() => itemsPress(item)}>
                                <View style={{ margin: 4}}>
                                    <View >
                                        <Image
                                            style={{ padding: 2, height: 200, width: '98%', resizeMode: 'contain', alignSelf: 'center', }}
                                            source={{ uri: item.image.uri }}
                                        />
                                    </View>
                                    <Text style={{ color: '#3b3a30', fontSize: 20, paddingLeft: 4, textTransform: 'capitalize' }}>{item.productName}</Text>
                                    <Text style={{ color: 'black', fontSize: 12, padding: 4 }}>{item.category+" : "+item.subCategory}</Text>
                                    <Text style={{ color: 'black', fontSize: 10, paddingLeft: 4 }}>{item.description}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ color: 'grey', fontSize: 15, paddingLeft: 2 }}>{"₹" + item.finalPrice}</Text>
                                        <Text style={{ color: 'grey', fontSize: 15, paddingLeft: 2, textDecorationLine: 'line-through' }}>{"₹" + item.productPrice}</Text>
                                        <Text style={{ color: '#82b74b', fontSize: 15, paddingLeft: 2 }}>{"(" + item.discount + "off )"}</Text>
                                    </View>

                                </View>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity style={{ flex: 1, margin: 5, flexDirection: 'row', padding: 10, elevation: 10, borderRadius: 4, backgroundColor: 'white', alignItems: 'center', }}
                                    onPress={() => {
                                        Alert.alert("Remove from Wishlist", "Are you sure ?",
                                            [
                                                { text: "No" },
                                                { text: "Yes", onPress: () => DeleteItem(items.indexOf(item)) }
                                            ], { cancelable: false }
                                        );
                                    }}>
                                    <MaterialCommunityIcons name="heart-remove" color='red' size={20} />
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black', marginLeft: 5 }}>Remove from Wishlist</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1, margin: 5, flexDirection: 'row', padding: 10, elevation: 10, borderRadius: 4, backgroundColor: 'white', alignItems: 'center', }}
                                    onPress={() => addToCart(item)}>
                                    <MaterialCommunityIcons name="cart-arrow-right" color='red' size={20} />
                                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'black', marginLeft: 10}}> Move to Cart</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}>


                </FlatList>

                <View style={{ position: 'absolute', zIndex: 4, alignSelf: 'center', flex: 1, top: '50%' }}>
                <ActivityIndicator

                    size='large'
                    color="grey"
                    animating={loader}

                />
            </View>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    main: {
        height: '100%',
        width: '100%'
    },
    container: {
        flex: 1,
        alignItems: "center",
        paddingTop: '50%'
    },
    text: {
        color: 'blue'
    }
});
