#!/bin/bash
# Documentation Update Script
# Run this script whenever significant changes are made to update the technical docs

echo "Updating project documentation..."

# Get current date
DATE=$(date +"%Y-%m-%d")

# Update the last modified date in TECHNICAL_DOCS.md
sed -i "s/\*\*Last Updated\*\*: .*/\*\*Last Updated\*\*: $DATE/" TECHNICAL_DOCS.md

echo "Documentation updated with current date: $DATE"
echo "Please review and update any sections that have changed:"
echo "- Architecture changes"
echo "- New features added"
echo "- Bug fixes implemented"
echo "- Performance improvements"
echo "- Security updates"
