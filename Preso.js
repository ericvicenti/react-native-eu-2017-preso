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
  TouchableOpacity,
  TouchableWithoutFeedback
} from "react-native";
import PhotoViewer from "./PhotoViewer";
import { Video } from "expo";
import { atomOneLight } from "react-syntax-highlighter/dist/styles";
import SyntaxHighlighter from "react-native-syntax-highlighter";

const CodeTag = ({ children }) =>
  <View
    style={{
      flex: 1,
      backgroundColor: "white",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    {children}
  </View>;

class CodePage extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <SyntaxHighlighter
          CodeTag={CodeTag}
          PreTag={CodeTag}
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
        {this.props.upperText &&
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
          </View>}

        {this.props.lowerText &&
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
          </View>}
      </View>
    );
  }
}

class CharacterScene extends React.Component {
  state = { playing: false };
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
                this._playbackObject && this._playbackObject.pauseAsync();
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
            {this.props.hasRN &&
              <Image
                style={{
                  flex: 5,
                  height: 400
                }}
                source={require("./rn-dude.png")}
                resizeMode="contain"
              />}
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
                  : 320,
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

const JSCharacterPage = ({ text }) =>
  <CharacterPage source={require("./js-gal.png")} text={text} />;

const NativeCharacterPage = ({ text }) =>
  <CharacterPage source={require("./native-gal.png")} text={text} />;

const RNCharacterPage = ({ text }) =>
  <CharacterPage source={require("./rn-dude.png")} text={text} />;

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

class PagerScrollView extends React.Component {
  state = { width: new Animated.Value(0), height: new Animated.Value(0) };
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
          showsHorizontalScrollIndicator={false}
          horizontal
          pagingEnabled
        >
          {this.props.items.map((item, index) =>
            <Animated.View key={index} style={{ width, height }}>
              {item}
            </Animated.View>
          )}
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

class PhotoViewerPage extends React.Component {
  render() {
    const { onPhotoOpen } = this.props;
    const photos = MAIN_PHOTOS.map(p => ({
      ...p,
      key: this.props.text + p.key
    }));
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            textAlign: "center",
            marginBottom: 100,
            fontSize: TITLE_SIZE
          }}
        >
          {this.props.text}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {photos.map(photo =>
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
          )}
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

import { transformSnippet, transformMathSnippet } from "./PresoSnippets.js";

class Preso extends React.Component {
  render() {
    return (
      <PhotoViewer
        renderContent={({ onPhotoOpen }) =>
          <PagerScrollView
            items={[
              <IntroPage title="Practical hacks for delightful interactions" />,
              <TitlePage title="Beautiful apps often rely on ugly hacks" />,
              <PhotoViewerPage
                onPhotoOpen={onPhotoOpen}
                text="Hacking on a Photo Viewer.."
              />,
              //<VideoPage />,
              <TitlePage title="Three practical hacks you can use today" />,

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
              <ImagePage
                source={require("./firewin.png")}
                upperText="useNativeDriver"
              />,
              <CodePage code="Animated.timing(..., {..., useNativeDriver: true})..." />,
              <CharacterScene jsSays="Please create a view with opacity 0" />,
              <CharacterScene nativeSays="Alright.. its up!" />,
              <CharacterScene jsSays="Now, animate the opacity to 1 on a linear curve for 500ms." />,
              <CharacterScene nativeSays="No problem!" />,

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
              <PhotoViewerPage
                onPhotoOpen={onPhotoOpen}
                text="Gymnastics for cropping"
              />,

              <CharacterScene hasRN nativeSays="No problem!" />,
              <ScrollingCodePage code={transformSnippet} />,
              <ScrollingCodePage code={transformMathSnippet} />,

              <TitlePage title="Hack 1. Animate on the UI thread" />,
              <TitlePage title="Verdict?" />,
              <TitlePage title="Verdict: Yes, hack it!" />,

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
                jsSays="In the next 4 frames, animate the photo down by 8px"
              />,

              <TitlePage title="Verdict?" />,
              <TitlePage title="Verdict: Not generally reccomended." />,
              <TitlePage title="2. Work around interaction lifecycle" />,
              <TitlePage title="Start slower work like measurement before touch is released" />,
              <TitlePage title="3. Abuse ScrollView" />,

              <PhotoViewerPage
                onPhotoOpen={onPhotoOpen}
                text="View > Image for cropping behavior"
              />,
              <CharacterScene
                hasRN
                startPosition={7000}
                jsSays="Translate the photo down by 1px. Now translate by 2px.."
              />,

              <TitlePage title="Verdict?" />,
              <TitlePage title="Verdict: Yes, hack it!" />,
              <ImagePage source={require("./shame.jpg")} lowerText="Shame?" />,
              <ImagePage
                source={require("./fire.jpg")}
                lowerText="Be proud of your hacks!"
              />,
              <TitlePage title="This was live-hacked" />,
              <TitlePage title="Today you can hack around threading and interaction timing" />,
              <TitlePage title="The future is bright, these hacks are temporary" />,
              <IntroPage title="Practical hacks for delightful interactions" />
            ]}
          />}
      />
    );
  }
}

StatusBar.setHidden(true);

module.exports = Preso;
