import React from "react";
import PropTypes from "prop-types";
import ReactNative, {
  Animated,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
  BackHandler,
  Platform,
  StatusBar,
  AsyncStorage,
  TouchableOpacity,
  TouchableWithoutFeedback
} from "react-native";
import PhotoViewer from "./PhotoViewer";
import { Video } from "expo";
import { atomOneLight } from "react-syntax-highlighter/dist/styles";
import SyntaxHighlighter from "react-native-syntax-highlighter";

const CodeTag = ({ children }) => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    {children}
  </View>
);

class CodePage extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <SyntaxHighlighter
          CodeTag={CodeTag}
          PreTag={CodeTag}
          fontSize={34}
          language="jsx"
          style={atomOneLight}
        >
          {this.props.code}
        </SyntaxHighlighter>
      </View>
    );
  }
}

class ScrollingCodePage extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <SyntaxHighlighter
          fontSize={34}
          language="jsx"
          style={{ ...atomOneLight, borderWidth: 0 }}
        >
          {this.props.code}
        </SyntaxHighlighter>
      </View>
    );
  }
}
class CharacterPage extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, borderWidth: 3 }}>
        <Image
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1024,
            height: 768
          }}
          resizeMode="cover"
          source={require("./desktop.png")}
        />
        <View
          style={{
            position: "absolute",
            height: 400,
            top: 100,
            left: 0,
            right: 0,
            alignItems: "center"
          }}
        >
          <Image
            style={{
              flex: 1
            }}
            source={this.props.source}
            resizeMode="contain"
          />
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            left: 0,
            height: 200,
            backgroundColor: "transparent"
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: TITLE_SIZE,
              backgroundColor: "transparent",
              textAlign: "center"
            }}
          >
            {this.props.text}
          </Text>
        </View>
      </View>
    );
  }
}

class ImagePage extends React.Component {
  render() {
    return (
      <View
        style={{
          flex: 1
        }}
      >
        <Image
          source={this.props.source}
          style={{
            backgroundColor: "black",
            resizeMode: "contain",
            width: 1024,
            height: 768
          }}
        />
        {this.props.upperText && (
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              position: "absolute",
              top: 0,
              right: 0,
              left: 0,
              height: 100
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 72
              }}
            >
              {this.props.upperText}
            </Text>
          </View>
        )}

        {this.props.lowerText && (
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              position: "absolute",
              bottom: 0,
              right: 0,
              left: 0,
              height: 100
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 72
              }}
            >
              {this.props.lowerText}
            </Text>
          </View>
        )}
      </View>
    );
  }
}

class CharacterScene extends React.Component {
  state = { playing: false };
  componentDidMount() {
    if (this.props.startPosition && this._playbackObject) {
      this._playbackObject.setPositionAsync(this.props.startPosition);
    }
  }
  render() {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (this.props.tapToPlay) {
            this.setState({ playing: true });
          }
        }}
      >
        <View style={{ flex: 1, borderWidth: 3, backgroundColor: "black" }}>
          <Video
            callback={status => {
              if (status.positionMillis > 2600) {
                //this._playbackObject && this._playbackObject.pauseAsync();
              }
            }}
            source={require("./phone-right.mov")}
            ref={playbackObject => {
              this._playbackObject = playbackObject;
            }}
            progressUpdateIntervalMillis={30}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1024,
              height: 580
            }}
            rate={1.0}
            volume={0}
            muted={true}
            shouldPlay={this.state.playing}
            isLooping
            resizeMode="contain"
          />
          <View
            style={{
              position: "absolute",
              height: 400,
              top: 100,
              left: 0,
              right: 0,
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            <Image
              style={{
                flex: 16,
                height: 400
              }}
              source={require("./js-gal.png")}
              resizeMode="contain"
            />
            {this.props.hasRN && (
              <Image
                style={{
                  flex: 5,
                  height: 400
                }}
                source={require("./rn-dude.png")}
                resizeMode="contain"
              />
            )}
            <Image
              style={{
                flex: 7,
                height: 400
              }}
              source={require("./native-gal.png")}
              resizeMode="contain"
            />
            <View style={{ flex: 8, backgroundColor: "transparent" }} />
          </View>
          {(this.props.jsSays ||
            this.props.rnSays ||
            this.props.nativeSays) && [
            <View
              key="carat"
              style={{
                position: "absolute",
                left: this.props.hasRN
                  ? this.props.jsSays ? 275 : this.props.nativeSays ? 620 : 445
                  : this.props.nativeSays ? 560 : 320,
                bottom: 140,
                height: 100,
                width: 100,
                backgroundColor: "white",
                transform: [{ rotate: "45deg" }]
              }}
            />,
            <View
              key="text"
              style={{
                borderRadius: 20,
                position: "absolute",
                bottom: 50,
                right: 50,
                left: 50,
                height: 150,
                padding: 30,
                backgroundColor: "white"
              }}
            >
              <Text
                style={{
                  color: "#333",
                  fontSize: 33,
                  backgroundColor: "transparent",
                  textAlign: "center"
                }}
              >
                {this.props.jsSays ||
                  this.props.rnSays ||
                  this.props.nativeSays}
              </Text>
            </View>
          ]}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const JSCharacterPage = ({ text }) => (
  <CharacterPage source={require("./js-gal.png")} text={text} />
);

const NativeCharacterPage = ({ text }) => (
  <CharacterPage source={require("./native-gal.png")} text={text} />
);

const RNCharacterPage = ({ text }) => (
  <CharacterPage source={require("./rn-dude.png")} text={text} />
);

class PhoneCharacterPage extends React.Component {
  render() {
    return (
      <Video
        source={require("./photo-viewer-demo.mov")}
        rate={1.0}
        volume={0}
        muted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={{ flex: 1 }}
      />
    );
  }
}

class VideoPage extends React.Component {
  render() {
    return (
      <Video
        source={require("./photo-viewer-demo.mov")}
        rate={1.0}
        volume={0}
        muted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={{ flex: 1 }}
      />
    );
  }
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

let lastLocation = null;

class PagerScrollView extends React.Component {
  state = {
    width: new Animated.Value(SCREEN_WIDTH),
    height: new Animated.Value(SCREEN_HEIGHT)
  };
  _sv: ?ScrollView = null;
  componentDidMount() {
    AsyncStorage.getItem("page_index", (err, data) => {
      if (data) {
        setTimeout(() => {
          this._sv.scrollResponderScrollTo({ x: SCREEN_WIDTH * Number(data) });
        }, 10);
      }
    });
  }
  render() {
    const { width, height } = this.state;
    return (
      <Animated.View
        style={{ flex: 1 }}
        onLayout={Animated.event([
          { nativeEvent: { layout: { width, height } } }
        ])}
      >
        <ScrollView
          ref={sv => {
            this._sv = sv;
          }}
          onScroll={e => {
            const { x } = e.nativeEvent.contentOffset;
            console.log("actually, ", x);
            if (x % SCREEN_WIDTH === 0) {
              const newLocation = x / SCREEN_WIDTH;
              if (newLocation !== lastLocation) {
                lastLocation = newLocation;
                AsyncStorage.setItem("page_index", "" + newLocation);
              }
            }
          }}
          scrollEventThrottle={64}
          showsHorizontalScrollIndicator={false}
          horizontal
          pagingEnabled
        >
          {this.props.items.map((item, index) => (
            <Animated.View key={index} style={{ width, height }}>
              {item}
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  }
}

class TitlePage extends React.Component {
  render() {
    return (
      <View
        style={{
          padding: 30,
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text style={{ fontSize: TITLE_SIZE, textAlign: "center" }}>
          {this.props.title}
        </Text>
      </View>
    );
  }
}
class IntroPage extends React.Component {
  render() {
    return (
      <View
        style={{
          padding: 30,
          flex: 1,
          backgroundColor: "#333",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text
          style={{ color: "white", fontSize: TITLE_SIZE, textAlign: "center" }}
        >
          {this.props.title}
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: TITLE_SIZE - 16,
            textAlign: "center",
            marginTop: 40
          }}
        >
          {"@ericvicenti".toUpperCase()}
        </Text>
      </View>
    );
  }
}
const PAGES = [];

const MAIN_PHOTOS = [
  {
    key: "a",
    width: 1500,
    height: 1000,
    source: {
      uri:
        "https://images.unsplash.com/photo-1484732710474-fe08580a0fc0?dpr=0.800000011920929&auto=format&fit=crop&w=1500&h=1000&q=80&cs=tinysrgb&crop=",
      cache: "force-cache"
    }
  },
  {
    key: "b",
    width: 1500,
    height: 996,
    source: {
      uri:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?dpr=0.800000011920929&auto=format&fit=crop&w=1500&h=996&q=80&cs=tinysrgb&crop=",
      cache: "force-cache"
    }
  },
  {
    key: "c",
    width: 1500,
    height: 1000,
    source: {
      uri:
        "https://images.unsplash.com/photo-1496482475496-a91f31e0386c?dpr=0.800000011920929&auto=format&fit=crop&w=1500&h=1000&q=80&cs=tinysrgb&crop=",
      cache: "force-cache"
    }
  }
];

const TITLE_SIZE = 48;
const SCREEN_SIZE = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT
};

class PhotoViewerPage extends React.Component {
  render() {
    const { onPhotoOpen } = this.props;
    const photos = MAIN_PHOTOS.map(p => ({
      ...p,
      key: this.props.text + p.key
    }));
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {photos.map(photo => (
            <TouchableWithoutFeedback
              key={photo.key}
              onPress={() => {
                onPhotoOpen(photos, photo.key);
              }}
            >
              <View
                style={{
                  width: 200,
                  height: 200,
                  margin: 20
                }}
              >
                <PhotoViewer.Photo
                  style={{ width: 200, height: 200 }}
                  photo={photo}
                />
              </View>
            </TouchableWithoutFeedback>
          ))}
        </View>
      </View>
    );
  }
}

class MultiMessagePage extends React.Component {
  state = { msg: 0 };
  render() {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          const msg =
            this.state.msg + 1 === this.props.messages.length
              ? 0
              : this.state.msg + 1;
          this.setState({ msg });
        }}
      >
        <View style={{ flex: 1 }}>
          <TitlePage title={this.props.messages[this.state.msg]} />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

// <MultiMessagePage
//   messages={[
//     "Smooth touch interactions are tricky",
//     "Especially in React Native"
//   ]}
// />,

import {
  transformSnippet,
  scrollEventSnippet,
  transformMathSnippet
} from "./PresoSnippets.js";

class BuildInPage extends React.Component {
  render() {
    return (
      <ScrollView pagingEnabled>
        <View style={{ ...SCREEN_SIZE }} />
      </ScrollView>
    );
  }
}
// class ScrollEffects extends React.Component {
//   scrollY = new Animated.Value(0);
//   render() {
//     return (
//       <Animated.ScrollView
//         style={{ flex: 1 }}
//         onScroll={Animated.event(
//           [{ nativeEvent: { contentOffset: { y: this.scrollY } } }],
//           { useNativeDriver: true }
//         )}
//         scrollEventThrottle={1}
//       >
//         <Animated.View
//           style={{
//             transforms: [{ translateY: this.scrollY }]
//           }}
//         >
//           <Text>Woa</Text>
//         </Animated.View>
//       </Animated.ScrollView>
//     );
//   }
// }

class Preso extends React.Component {
  render() {
    return (
      <PhotoViewer
        renderContent={({ onPhotoOpen }) => (
          <PagerScrollView
            items={[
              <IntroPage title="Practical hacks for delightful interactions" />,
              <PhotoViewerPage
                onPhotoOpen={onPhotoOpen}
                text="Beautiful UI often relies on ugly hacks"
              />,
              <TitlePage title="Three practical hacks you can use today" />,
              <ImagePage source={require("./yodawg.jpg")} />,
              <MultiMessagePage
                messages={["Our toolbox", "Animated", "Responder Event System"]}
              />,
              <TitlePage title="Our toolbox: Animated and responder systems" />,
              <TitlePage title="Who's doing the work?" />,

              <JSCharacterPage text="JS thread reads and executes your code" />,
              <NativeCharacterPage text="UI/Main thread puts stuff on screen" />,

              <CodePage code="const opacity = new Animated.Value(0);" />,
              <CodePage code="<Animated.View style={{opacity}} />" />,
              <CodePage code="Animated.timing(opacity, {toValue: 1}).start();" />,

              <CharacterScene jsSays="Please create a view with opacity 0" />,
              <CharacterScene jsSays="Then, change opacity to 0.01. Then change opacity to 0.02..." />,

              <TitlePage title="Hack 1. Animate on the UI thread" />,
              <CharacterScene jsSays="Please create a view with opacity 0" />,
              <CharacterScene nativeSays="Alright.. its up!" />,
              <CharacterScene jsSays="Now, animate the opacity to 1 on a linear curve for 500ms." />,
              <CharacterScene nativeSays="No problem!" />,
              <ImagePage
                source={require("./firewin.png")}
                upperText="useNativeDriver"
              />,
              <CodePage code="Animated.timing(v, {useNativeDriver: true,.." />,

              <TitlePage title="Works for opacity and transforms" />,
              <TitlePage title="Doesn't support flexbox, position, or Image resizeMode" />,

              <RNCharacterPage text="RN thread (or shadow thread) does layout logic and other work" />,

              <CharacterScene
                hasRN
                jsSays="Create a view with position and flexbox values.."
              />,
              <CharacterScene
                hasRN
                rnSays="Create a view at coordinates x, y, width, height"
              />,
              <CharacterScene
                hasRN
                nativeSays="Ok, but I cannot animate position or flexbox at 60fps.."
              />,

              <CharacterScene
                hasRN
                jsSays="Instead, scale the photo up by 247% on an ease over the next 500ms."
              />,
              <CharacterScene hasRN nativeSays="No problem!" />,

              <PhotoViewerPage
                onPhotoOpen={onPhotoOpen}
                text="Manual layout is tedious and fragile"
              />,

              <ScrollingCodePage code={transformSnippet} />,
              <ScrollingCodePage code={transformMathSnippet} />,

              <TitlePage title="Hack 1. Animate on the UI thread" />,

              <CharacterScene hasRN tapToPlay />,
              <TitlePage title="Gesture Responder System, PanResponder" />,

              <CharacterScene
                hasRN
                startPosition={7000}
                nativeSays="A tap has started"
              />,
              <CharacterScene
                hasRN
                startPosition={7000}
                jsSays="Ok, I'll keep track of this"
              />,
              <CharacterScene
                hasRN
                startPosition={7000}
                jsSays="Translate the photo down by 1px. Now translate by 2px.."
              />,

              <TitlePage title="2. Work around interaction lifecycle" />,

              <CharacterScene
                hasRN
                startPosition={7000}
                jsSays="Over the next 4 frames, animate the photo down by 8px"
              />,

              <TitlePage title="Allows for smooth motion.. with noticible latency" />,
              <TitlePage title="2. Work around interaction lifecycle" />,
              <TitlePage title="Start animation work on touch-down" />,
              <TitlePage title="2. Work around interaction lifecycle" />,

              <PhotoViewerPage
                onPhotoOpen={onPhotoOpen}
                text="How does this work"
              />,
              <CharacterScene
                hasRN
                startPosition={7000}
                jsSays="As the user swipes, change the styles in this way."
              />,
              <ImagePage
                source={require("./rninteractable.png")}
                upperText="RN Interactable"
              />,

              <ImagePage
                source={require("./rngesturehandler.png")}
                upperText="RN Gesture Handler"
              />,

              <TitlePage title="What's the hack?" />,
              <ImagePage source={require("./yodawg.jpg")} />,
              <TitlePage title="3. Abuse ScrollView" />,

              <CharacterScene
                hasRN
                startPosition={7000}
                jsSays="As the scroll position changes, transform in this way.."
              />,
              // <ScrollEffects />,
              <ScrollingCodePage code={scrollEventSnippet} />,

              <PhotoViewerPage
                onPhotoOpen={onPhotoOpen}
                text="Result of these hacks"
              />,
              <ImagePage source={require("./shame.jpg")} lowerText="Shame?" />,
              <ImagePage
                source={require("./fire.jpg")}
                lowerText="Be proud of your hacks!"
              />,
              <TitlePage title="Today you can hack around threading and interaction timing" />,
              <TitlePage title="The future is bright, these hacks are temporary" />,
              <IntroPage title="Practical hacks for delightful interactions" />
            ]}
          />
        )}
      />
    );
  }
}

StatusBar.setHidden(true);

module.exports = Preso;
