#!/usr/bin/env python3
import json
import requests


def main():
    """
    This script will check which of the homework exercises you have done and advise on what else to do.
    install the requests library (pip3 install requests) then edit your USERNAME in the py file

    NOTE: Scraping for the tasks was done on 2022-05-12 and as such it only has the homework links currently visible.
    
    @Author Krisztian Gancs
    """
    # Change me!
    USERNAME = "ruszkipista"

    # Program starts here:
    TASKS = {
        "strange-strings-8kyu-1": ["55902c5eaa8069a5b4000083", "57eaeb9578748ff92a000009", "57cfdf34902f6ba3d300001e",
                                   "57eadb7ecd143f4c9c0000a3", "5a360620f28b82a711000047", "559ac78160f0be07c200005a",
                                   "563b74ddd19a3ad462000054", "50654ddff44f800200000004", "57eae65a4321032ce000002d",
                                   "57cc975ed542d3148f00015b", "57eae20f5500ad98e50002c5", "56bc28ad5bdaeb48760009b0",
                                   "559f3123e66a7204f000009f", "57613fb1033d766171000d60", "57ab2d6072292dbf7c000039",
                                   "557af9418895e44de7000053", "5547929140907378f9000039", "57f222ce69e09c3630000212",
                                   "5aa736a455f906981800360d"],
        "jealous-jumpers": ["55eca815d0d20962e1000106", "55a2d7ebe362935a210000b2", "5aa736a455f906981800360d",
                            "56bc28ad5bdaeb48760009b0", "577bd026df78c19bca0002c0", "57eae20f5500ad98e50002c5",
                            "57fb09ef2b5314a8a90001ed", "5583090cbe83f4fd8c000051", "57241e0f440cd279b5000829",
                            "57a4d500e298a7952100035d", "57a0e5c372292dd76d000d7e", "57f781872e3d8ca2a000007e",
                            "525c1a07bb6dda6944000031", "55225023e1be1ec8bc000390", "54edbc7200b811e956000556",
                            "571d42206414b103dc0006a1", "50654ddff44f800200000007", "559d2284b5bb6799e9000047",
                            "55edaba99da3a9c84000003b", "51c8991dee245d7ddf00000e"],
        "numerous-nuances": ["52adc142b2651f25a8000643", "53369039d7ab3ac506000467", "57a5c31ce298a7e6b7000334",
                             "5715eaedb436cf5606000381", "5a34af40e1ce0eb1f5000036", "57e1e61ba396b3727c000251",
                             "59bd5dc270a3b7350c00008b", "55685cd7ad70877c23000102", "5a2be17aee1aaefe2a000151",
                             "5a00e05cc374cb34d100000d", "53da3dbb4a5168369a0000fe", "58dbdccee5ee8fa2f9000058",
                             "55a4f9afeffe4231090000d6", "555a67db74814aa4ee0001b5", "55ad04714f0b468e8200001c",
                             "572b6b2772a38bc1e700007a", "524f5125ad9c12894e00003f", "57fae964d80daa229d000126",
                             "57a2013acf1fa5bfc4000921"],
        "ornamental-objectives": ["5648b12ce68d9daa6b000099", "56530b444e831334c0000020", "5899642f6e1b25935d000161",
                                  "5a6663e9fd56cb5ab800008b", "595970246c9b8fa0a8000086", "58cb43f4256836ed95000f97",
                                  "5601409514fc93442500010b", "5a0be7ea8ba914fc9c00006b", "59c8b38423dacc7d95000008",
                                  "58bf9bd943fadb2a980000a7", "574b3b1599d8f897470018f6", "55ccdf1512938ce3ac000056",
                                  "56f695399400f5d9ef000af5", "577a6e90d48e51c55e000217", "5748a883eb737cab000022a6"],
        "diverging-dungeons": ["5a34b80155519e1a00000009", "56b7f2f3f18876033f000307", "5a3dd29055519e23ec000074",
                               "55a996e0e8520afab9000055", "5a2fd38b55519ed98f0000ce", "5890d8bc9f0f422cf200006b",
                               "5c8bfa44b9d1192e1ebd3d15", "56fc55cd1f5a93d68a001d4e", "5bb904724c47249b10000131",
                               "56598d8076ee7a0759000087", "58ca658cc0d6401f2700045f", "5704aea738428f4d30000914",
                               "5672a98bdbdd995fad00000f", "56170e844da7c6f647000063", "548ef5b7f33a646ea50000b2"],
        "elementary-expeditions": ["5720a1cb65a504fdff0003e2", "5467e4d82edf8bbf40000155", "56ff6a70e1a63ccdfa0001b1",
                                   "57ee4a67108d3fd9eb0000e7", "58f8a3a27a5c28d92e000144", "55f2b110f61eb01779000053",
                                   "53f0f358b9cb376eca001079", "56cd44e1aa4ac7879200010b", "55c0ac142326fdf18d0000af",
                                   "55a13556ca4a6d0ab4000003", "56bcaedfcf6b7f2125001118", "5875b200d520904a04000003",
                                   "554b4ac871d6813a03000035", "54ff3102c1bad923760001f3", "5174a4c0f2769dd8b1000003",
                                   "5667e8f4e3f572a8f2000039", "54ba84be607a92aa900000f1", "5412509bd436bd33920011bc",
                                   "554e4a2f232cdd87d9000038", "577b9960df78c19bca00007e"],
        "quiet-quanta": ["5318f00b31b30925fd0001f8", "56dbe7f113c2f63570000b86", "5208f99aee097e6552000148",
                         "550554fd08b86f84fe000a58", "576757b1df89ecf5bd00073b", "57eb8fcdf670e99d9b000272",
                         "54da5a58ea159efa38000836", "515de9ae9dcfc28eb6000001", "541c8630095125aba6000c00",
                         "514b92a657cdc65150000006"],
        "boring-bananas": ["57b06f90e298a7b53d000a86", "550498447451fbbd7600041c", "550f22f4d758534c1100025a",
                           "556deca17c58da83c00002db", "54dc6f5a224c26032800005c"],
        "practical-pyramids": ["546f922b54af40e1e90001da", "586538146b56991861000293", "52e1476c8147a7547a000811",
                               "58b57ae2724e3c63df000006", "54bf1c2cd5b56cc47f0007a1"],
        "absolute-algorithms": ["5a7f58c00025e917f30000f1", "57f548337763f20e02000114", "556e0fccc392c527f20000c5",
                                "530e15517bc88ac656000716", "5626b561280a42ecc50000d1"],
        "functional-fruits": ["52efefcbcdf57161d4000091", "55c45be3b2079eccff00010f", "578aa45ee9fd15ff4600090d",
                              "58f5c63f1e26ecda7e000029", "546f922b54af40e1e90001da"]
    }

    user_done = get_completed(USERNAME)

    # Format -> [name, total, completed, not completed, percentage]
    table = []

    # Calculate completion
    for name in TASKS:
        # Get kata list and set locals
        katas = TASKS[name]
        total = len(katas)
        completed = 0

        # Calculate completion
        for kata in katas:
            if kata in user_done:
                completed += 1
        table.append([name, total, completed, total - completed, int(completed / total * 100)])

    # Print table
    print("|--------------------------------|------|------|------|------|")
    print("| {:30} |{:4} | {:4} | {:4} | {:3}%|".format("Homework CW collection name", "Total", "Done", "New", "Done"))
    print("|--------------------------------|------|------|------|------|")
    for row in table:
        print("| {:30} | {:4} | {:4} | {:4} | {:3}% |".format(*row))
    print("|--------------------------------|------|------|------|------|")


def get_completed(user, api_base="https://www.codewars.com/api/v1/users/"):
    """
    Returns the list of the ids of the katas the user has completed.
    """
    ids = []
    page = -1

    while True:
        # Increment page
        page = page + 1
        # Get page url
        url = api_base + user + "/code-challenges/completed?page=" + str(page)
        # Get page of results
        full_resp = requests.get(url)
        json_resp = json.loads(full_resp.text)

        # For each kata ... store id
        for kata in json_resp["data"]:
            ids.append(kata["id"])

        # At the last page break out
        if page == json_resp["totalPages"]:
            break

    return ids


if __name__ == "__main__":
    main()
