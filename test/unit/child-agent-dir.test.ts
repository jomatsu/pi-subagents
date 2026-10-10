import assert from "node:assert/strict";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { getAgentDir, getChildAgentDir, SUBAGENT_CHILD_AGENT_DIR_ENV } from "../../src/shared/utils.ts";

const saved: Record<string, string | undefined> = {};
const KEYS = ["PI_CODING_AGENT_DIR", SUBAGENT_CHILD_AGENT_DIR_ENV, "HOME", "USERPROFILE"];

describe("getChildAgentDir", () => {
	beforeEach(() => {
		for (const key of KEYS) saved[key] = process.env[key];
		process.env.HOME = "/home/test";
		process.env.USERPROFILE = "/home/test";
		process.env.PI_CODING_AGENT_DIR = "/profiles/parent";
	});
	afterEach(() => {
		for (const key of KEYS) {
			if (saved[key] === undefined) delete process.env[key];
			else process.env[key] = saved[key];
		}
	});

	it("falls back to the parent agent dir when unset or blank", () => {
		delete process.env[SUBAGENT_CHILD_AGENT_DIR_ENV];
		assert.equal(getChildAgentDir(), getAgentDir());
		process.env[SUBAGENT_CHILD_AGENT_DIR_ENV] = "   ";
		assert.equal(getChildAgentDir(), "/profiles/parent");
	});

	it("uses the override and expands ~", () => {
		process.env[SUBAGENT_CHILD_AGENT_DIR_ENV] = "/profiles/sub";
		assert.equal(getChildAgentDir(), "/profiles/sub");
		process.env[SUBAGENT_CHILD_AGENT_DIR_ENV] = "~/.pi/agents/sub";
		assert.equal(getChildAgentDir(), path.join("/home/test", ".pi/agents/sub"));
		assert.equal(getAgentDir(), "/profiles/parent");
	});
});
