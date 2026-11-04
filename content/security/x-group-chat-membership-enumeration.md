## Technical description

Membership of an X group chat should be visible only to its current members. This finding concerns a gap in that boundary: a user who had left a group chat could still use that former membership to infer whether a specific person was still in the chat.

## Potential impact

Group membership can be sensitive. Knowing that a particular person is still part of a private group can reveal relationships, affiliations or activity that the group's current members expect to keep among themselves. The exposure is limited to people who were members at some point.

## Reproduction

Reproduction steps are withheld. They will be published only once the vendor has resolved the issue and public disclosure is appropriate.

## Suggested remediation

Checks that guard membership information should be based on the requester's current membership, not a past one. Responses to former members should not vary with who is still in the chat.
