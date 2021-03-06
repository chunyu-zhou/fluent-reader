import { shell, remote } from "electron"
import { ThunkAction, ThunkDispatch } from "redux-thunk"
import { AnyAction } from "redux"
import { RootState } from "./reducer"

export enum ActionStatus {
    Request, Success, Failure, Intermediate
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>

export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>

import Parser = require("@yang991178/rss-parser")
const customFields = {
    item: ["thumb", "image", ["content:encoded", "fullContent"]] as Parser.CustomFieldItem[]
}

import ElectronProxyAgent = require("@yang991178/electron-proxy-agent")
import { ViewType } from "./models/page"
import { IPartialTheme } from "@fluentui/react"
import { SourceGroup } from "./models/group"
let agent = new ElectronProxyAgent(remote.getCurrentWebContents().session)
export const rssParser = new Parser({
    customFields: customFields,
    requestOptions: {
        agent: agent
    }
})

export const domParser = new DOMParser()

const favicon = require("favicon")
export function faviconPromise(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        favicon(url, (err, icon: string) => {
            if (err) reject(err)
            else if (!icon) resolve(icon)
            else {
                let parts = icon.split("//")
                resolve(parts[0] + "//" + parts[parts.length - 1])
            }
        })
    })
}

export function htmlDecode(input: string) {
    var doc = domParser.parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

export function openExternal(url: string) {
    if (url.startsWith("https://") || url.startsWith("http://"))
        shell.openExternal(url)
}

export const urlTest = (s: string) => 
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi.test(s)

export const getWindowBreakpoint = () => remote.getCurrentWindow().getSize()[0] >= 1441

export const cutText = (s: string, length: number) => {
    return (s.length <= length) ? s : s.slice(0, length) + "…"
}

export const googleSearch = (text: string) => openExternal("https://www.google.com/search?q=" + encodeURIComponent(text))

export function mergeSortedArrays<T>(a: T[], b: T[], cmp: ((x: T, y: T) => number)): T[] {
    let merged = new Array<T>()
    let i = 0
    let j = 0
    while (i < a.length && j < b.length) {
        if (cmp(a[i], b[j]) <= 0) {
            merged.push(a[i++])
        } else {
            merged.push(b[j++])
        }
    }
    while (i < a.length) merged.push(a[i++])
    while (j < b.length) merged.push(b[j++])
    return merged
}

export function byteToMB(B: number) {
    let MB = Math.round(B / 1048576)
    return MB + "MB"
}

export function calculateItemSize(): Promise<number> {
    return new Promise((resolve, reject) => {
        let openRequest = window.indexedDB.open("NeDB")
        openRequest.onsuccess = () => {
            let db = openRequest.result
            let objectStore = db.transaction("nedbdata").objectStore("nedbdata")
            let getRequest = objectStore.get("items")
            getRequest.onsuccess = () => {
                let resultBuffer = Buffer.from(getRequest.result)
                resolve(resultBuffer.length)
            }
            getRequest.onerror = () => reject()
        }
        openRequest.onerror = () => reject()
    })
}