import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import React from "react";
import StyleSheet from "react-native-extended-stylesheet";

import { Button, Icon, Input, Switch, Text, View } from "./__primitives__";
import { style } from "./App.style";
import { Card, Option } from "./components";
import { defaultTheme } from "./themes/default.theme";

StyleSheet.build(defaultTheme);

export const App = () => {
  const [ready] = useFonts({
    "font-default": require("../assets/fonts/Roobert-400.ttf"),
    // "font-bold": require("../assets/fonts/Roobert-700.ttf"),
    // "font-default": require("../assets/fonts/Rebond-Grotesque-600.ttf"),
    "font-bold": require("../assets/fonts/Rebond-Grotesque-700.ttf"),
    // 'font-icon': require('../assets/fonts/Icons.ttf'),
  });

  return ready ? (
    <View style={style.container}>
      <StatusBar style="auto" />
      <Card>
        <Text bold subtitle>
          Become a Guardian
        </Text>
        <Text caption>Add a QR code to become a guardian of a Secret</Text>
        <Button wide>Add via a QR Code</Button>
        <Button secondary wide>
          Add via a Text Code
        </Button>
      </Card>

      {/* <View align="center"> */}
      <Text align="center" bold subtitle>
        Select Guardians amount
      </Text>
      <Text align="center" caption>
        Pick amount of Guardians which will be responsible for keepin the Shards
        (parts) of your Secret.
      </Text>
      <Card>
        <View gap row>
          <Option>1 Guardian</Option>
          <Option checked>3 Guardians</Option>
          <Option disabled>5 Guardians</Option>
        </View>

        <View style={style.anchor} />

        <View gap row>
          <Text color="contentLight" tiny>
            Keep one Shard encrypted on my device every time I create a new
            Secret.
          </Text>
          <Switch checked />
        </View>
      </Card>

      <Card align="center">
        <Icon />
        <Text align="center" caption>
          Recovering Secrets from this Vault will require approval of at least 2
          out of 3 Guardians.
        </Text>
      </Card>

      <Input
        align="center"
        multiline
        placeholder="Type your secret..."
        value="abandon bridge buddy supreme exclude milk consider tail expand wasp pattern"
      />

      <Input align="center" placeholder="Type your secret..." value="abandon" />

      <Button>Continue</Button>
    </View>
  ) : null;
};
