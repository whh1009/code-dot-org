module Queries
  class SchoolInfo
    def self.last_complete(user)
      UserSchoolInfo.last_complete(user)&.school_info
    end
  end
end
