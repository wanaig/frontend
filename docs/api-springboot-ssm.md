# 奈雪的茶小程序 - Spring Boot + SSM 后端实现文档

---

## 一、技术架构

### 1.1 技术选型
- **基础框架**: Spring Boot 2.7 (自动配置、快速启动)
- **Web 层**: Spring MVC 5.3 (REST API)
- **持久层**: MyBatis 3.5 (SQL 映射)
- **构建工具**: Maven
- **数据库**: MySQL 8.0
- **连接池**: Druid
- **认证**: JWT (jjwt 0.11.5)
- **通信**: RESTful API + JSON (前后端完全分离)

### 1.2 项目结构 (Spring Boot + SSM)

```
naixue-server/
├── pom.xml
├── src/main/
│   ├── java/com/naixue/
│   │   ├── NaixueApplication.java      # Spring Boot 启动类
│   │   ├── config/                    # 配置类
│   │   │   ├── WebMvcConfig.java      # Spring MVC 配置
│   │   │   ├── WebCorsConfig.java    # CORS 跨域配置
│   │   │   └── JwtConfig.java        # JWT 配置
│   │   ├── controller/                # C - Controller 层 (REST API)
│   │   │   ├── MemberController.java
│   │   │   ├── StoreController.java
│   │   │   ├── GoodsController.java
│   │   │   ├── OrderController.java
│   │   │   └── ...
│   │   ├── service/                  # Service 层接口
│   │   │   ├── MemberService.java
│   │   │   ├── StoreService.java
│   │   │   └── ...
│   │   ├── service/impl/             # Service 层实现
│   │   │   ├── MemberServiceImpl.java
│   │   │   └── ...
│   │   ├── mapper/                  # M - Mapper 层 (MyBatis DAO)
│   │   │   ├── MemberMapper.java
│   │   │   ├── MemberMapper.xml
│   │   │   ├── StoreMapper.java
│   │   │   ├── StoreMapper.xml
│   │   │   └── ...
│   │   ├── entity/                  # 实体类 (Model)
│   │   │   ├── Member.java
│   │   │   ├── Store.java
│   │   │   ├── Goods.java
│   │   │   ├── Order.java
│   │   │   └── ...
│   │   ├── dto/                    # 数据传输对象 (请求)
│   │   │   ├── LoginDTO.java
│   │   │   ├── CreateOrderDTO.java
│   │   │   └── ...
│   │   ├── vo/                     # 视图对象 (响应)
│   │   │   ├── MemberInfoVO.java
│   │   │   ├── LoginVO.java
│   │   │   └── ...
│   │   ├── interceptor/            # 拦截器
│   │   │   └── JwtInterceptor.java
│   │   ├── utils/                 # 工具类
│   │   │   ├── JwtUtils.java
│   │   │   ├── WechatUtils.java
│   │   │   └── Result.java
│   │   └── exception/             # 异常处理
│   │       ├── GlobalExceptionHandler.java
│   │       ├── BusinessException.java
│   │       └── ResultCode.java
│   └── resources/
│       ├── application.yml          # Spring Boot 配置
│       ├── jdbc.properties         # 数据库配置
│       └── mapper/                 # MyBatis XML 映射文件
│           ├── MemberMapper.xml
│           ├── StoreMapper.xml
│           └── ...
└── sql/
    └── init.sql
```

---

## 二、配置文件

### 2.1 pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.18</version>
        <relativePath/>
    </parent>

    <groupId>com.naixue</groupId>
    <artifactId>naixue-server</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    <name>naixue-server</name>
    <description>奈雪的茶小程序后端服务</description>

    <properties>
        <java.version>17</java.version>
        <mybatis.version>3.5.15</mybatis.version>
        <mybatis-spring.version>2.1.2</mybatis-spring.version>
        <druid.version>1.2.18</druid.version>
        <jwt.version>0.11.5</jwt.version>
        <hutool.version>5.8.22</hutool.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot AOP (事务支持) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>

        <!-- MyBatis -->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>${mybatis.version}</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>${mybatis-spring.version}</version>
        </dependency>

        <!-- MyBatis Spring Boot Starter -->
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.3.1</version>
        </dependency>

        <!-- MySQL Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Druid 连接池 -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>${druid.version}</version>
        </dependency>

        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Jackson JSON -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.datatype</groupId>
            <artifactId>jackson-datatype-jsr310</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Hutool 工具类 -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>${hutool.version}</version>
        </dependency>

        <!-- Spring Boot Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### 2.2 application.yml

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: naixue-server

  # 数据库配置
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/naixue?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
    username: root
    password: your_password
    type: com.alibaba.druid.pool.DruidDataSource
    druid:
      initial-size: 5
      min-idle: 5
      max-active: 20
      max-wait: 60000
      time-between-eviction-runs-millis: 60000
      min-evictable-idle-time-millis: 300000

  # JSON 配置
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: GMT+8
    serialization:
      write-dates-as-timestamps: false

# MyBatis 配置
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.naixue.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# JWT 配置
jwt:
  secret: naixue-secret-key-2024-change-in-production
  expiration: 604800  # 7天，单位秒

# 微信小程序配置
wechat:
  appid: your-wechat-appid
  secret: your-wechat-secret

# 日志配置
logging:
  level:
    com.naixue: DEBUG
    org.springframework: INFO
```

---

## 三、启动类和配置类

### 3.1 NaixueApplication.java

```java
package com.naixue;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.naixue.mapper")  // MyBatis Mapper 扫描
public class NaixueApplication {

    public static void main(String[] args) {
        SpringApplication.run(NaixueApplication.class, args);
    }
}
```

### 3.2 WebMvcConfig.java

```java
package com.naixue.config;

import com.naixue.interceptor.JwtInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/member/login",
                        "/store",
                        "/goods",
                        "/banner",
                        "/static/**"
                );
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 3.3 JwtConfig.java

```java
package com.naixue.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    private String secret;
    private Long expiration; // 秒
}
```

---

## 四、实体类 (Model)

### 4.1 Member.java

```java
package com.naixue.entity;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Member implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long customerId;
    private String openid;
    private String unionid;
    private String nickname;
    private String avatar;
    private String mobilePhone;
    private Integer gender;
    private String cardNo;
    private Integer memberLevel;
    private String username;
    private String province;
    private String city;
    private String district;
    private Long storeId;
    private LocalDateTime openingCardDate;
    private String cardUrl;
    private Integer pointNum;
    private Integer couponNum;
    private BigDecimal balance;
    private BigDecimal giftBalance;
    private BigDecimal expenseAmount;
    private Integer currentValue;
    private LocalDateTime birthday;
    private String memberOrigin;
    private LocalDateTime lastLoginTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer deleted;
}
```

### 4.2 Store.java

```java
package com.naixue.entity;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Store implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String address;
    private String mobile;
    private String tel;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private String areaName;
    private Boolean isOpen;
    private Boolean isTakeout;
    private Boolean takeoutServerStatus;
    private Boolean forhereIsOpen;
    private BigDecimal minPrice;
    private BigDecimal packingFee;
    private BigDecimal deliveryCost;
    private Integer avgDeliveryCostTime;
    private Boolean isShow;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 4.3 Goods.java

```java
package com.naixue.entity;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Goods implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long categoryId;
    private String name;
    private BigDecimal price;
    private String content;
    private String images;
    private Boolean useProperty;
    private BigDecimal stock;
    private Integer sales;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 关联属性（非数据库字段）
    private List<GoodsProperty> properties;
}
```

---

## 五、DTO 和 VO

### 5.1 LoginDTO.java

```java
package com.naixue.dto;

import lombok.Data;

@Data
public class LoginDTO {
    private String code;
    private String encryptedData;
    private String iv;
}
```

### 5.2 LoginVO.java

```java
package com.naixue.vo;

import lombok.Data;
import java.io.Serializable;

@Data
public class LoginVO implements Serializable {
    private String token;
    private String tokenType;
    private Integer expiresIn;
    private Long customerId;
    private String nickname;
    private String avatar;
    private String mobilePhone;
    private Boolean isNewMember;
}
```

### 5.3 MemberInfoVO.java

```java
package com.naixue.vo;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class MemberInfoVO implements Serializable {
    private Long customerId;
    private String nickname;
    private String avatar;
    private String mobilePhone;
    private Integer gender;
    private String cardNo;
    private String cardName;
    private Integer memberLevel;
    private String memberLevelName;
    private Integer pointNum;
    private Integer couponNum;
    private BigDecimal balance;
    private BigDecimal giftBalance;
    private Integer currentValue;
    private Integer needValue;
    private String birthday;
    private String memberOrigin;
    private BigDecimal expenseAmount;
    private Integer level;
}
```

---

## 六、Mapper 层 (MyBatis DAO)

### 6.1 MemberMapper.java

```java
package com.naixue.mapper;

import com.naixue.entity.Member;
import org.apache.ibatis.annotations.*;
import java.math.BigDecimal;

@Mapper
public interface MemberMapper {

    @Select("SELECT * FROM member WHERE openid = #{openid} LIMIT 1")
    Member selectByOpenid(@Param("openid") String openid);

    @Select("SELECT * FROM member WHERE customer_id = #{customerId}")
    Member selectById(@Param("customerId") Long customerId);

    @Insert("INSERT INTO member (openid, unionid, nickname, avatar, member_level, " +
            "point_num, balance, gift_balance, current_value, member_origin, " +
            "last_login_time, created_at, updated_at) " +
            "VALUES (#{openid}, #{unionid}, #{nickname}, #{avatar}, #{memberLevel}, " +
            "#{pointNum}, #{balance}, #{giftBalance}, #{currentValue}, #{memberOrigin}, " +
            "#{lastLoginTime}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "customerId")
    int insert(Member member);

    @Update("UPDATE member SET nickname = #{nickname}, avatar = #{avatar}, " +
            "mobile_phone = #{mobilePhone}, gender = #{gender}, birthday = #{birthday}, " +
            "updated_at = NOW() WHERE customer_id = #{customerId}")
    int updateById(Member member);

    @Update("UPDATE member SET last_login_time = NOW() WHERE customer_id = #{customerId}")
    int updateLoginTime(@Param("customerId") Long memberId);

    @Update("UPDATE member SET point_num = point_num + #{points} WHERE customer_id = #{customerId}")
    int incrementPoints(@Param("customerId") Long memberId, @Param("points") Integer points);

    @Update("UPDATE member SET balance = balance + #{amount} WHERE customer_id = #{customerId}")
    int incrementBalance(@Param("customerId") Long memberId, @Param("amount") BigDecimal amount);
}
```

### 6.2 StoreMapper.java

```java
package com.naixue.mapper;

import com.naixue.entity.Store;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface StoreMapper {

    @Select("SELECT * FROM store WHERE is_show = 1 ORDER BY id")
    List<Store> selectAll();

    @Select("SELECT * FROM store WHERE id = #{id}")
    Store selectById(Long id);
}
```

### 6.3 MemberMapper.xml (复杂查询)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.naixue.mapper.MemberMapper">

    <resultMap id="BaseResultMap" type="com.naixue.entity.Member">
        <id column="customer_id" property="customerId"/>
        <result column="openid" property="openid"/>
        <result column="unionid" property="unionid"/>
        <result column="nickname" property="nickname"/>
        <result column="avatar" property="avatar"/>
        <result column="mobile_phone" property="mobilePhone"/>
        <result column="gender" property="gender"/>
        <result column="card_no" property="cardNo"/>
        <result column="member_level" property="memberLevel"/>
        <result column="point_num" property="pointNum"/>
        <result column="balance" property="balance"/>
        <result column="gift_balance" property="giftBalance"/>
        <result column="current_value" property="currentValue"/>
        <result column="member_origin" property="memberOrigin"/>
        <result column="last_login_time" property="lastLoginTime"/>
        <result column="created_at" property="createdAt"/>
        <result column="updated_at" property="updatedAt"/>
    </resultMap>

    <select id="selectByOpenid" resultMap="BaseResultMap">
        SELECT * FROM member
        WHERE openid = #{openid}
        LIMIT 1
    </select>

    <select id="selectById" resultMap="BaseResultMap">
        SELECT * FROM member
        WHERE customer_id = #{customerId}
    </select>

</mapper>
```

---

## 七、Service 层

### 7.1 MemberService.java (接口)

```java
package com.naixue.service;

import com.naixue.dto.LoginDTO;
import com.naixue.vo.LoginVO;
import com.naixue.vo.MemberInfoVO;

public interface MemberService {

    /**
     * 微信授权登录
     */
    LoginVO login(LoginDTO dto);

    /**
     * 获取会员信息
     */
    MemberInfoVO getMemberInfo(Long memberId);

    /**
     * 更新会员信息
     */
    void updateMemberInfo(Long memberId, String nickname, String avatar,
                         Integer gender, String birthday);
}
```

### 7.2 MemberServiceImpl.java (实现)

```java
package com.naixue.service.impl;

import com.naixue.dto.LoginDTO;
import com.naixue.entity.Member;
import com.naixue.exception.BusinessException;
import com.naixue.mapper.MemberMapper;
import com.naixue.service.MemberService;
import com.naixue.utils.JwtUtils;
import com.naixue.utils.WechatUtils;
import com.naixue.vo.LoginVO;
import com.naixue.vo.MemberInfoVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberMapper memberMapper;
    private final JwtUtils jwtUtils;
    private final WechatUtils wechatUtils;

    // 会员等级配置
    private static final String[] LEVEL_NAMES = {"", "V1", "V2", "V3", "V4", "V5", "V6"};
    private static final int[] LEVEL_VALUES = {0, 500, 2000, 5000, 15000, 50000};

    @Override
    @Transactional
    public LoginVO login(LoginDTO dto) {
        // 1. 调用微信接口获取 openid
        WechatUtils.WechatSessionResult wechatResult;
        try {
            wechatResult = wechatUtils.code2Session(dto.getCode());
        } catch (Exception e) {
            log.error("微信登录失败: {}", e.getMessage());
            throw new BusinessException(1001, "微信登录失败");
        }

        // 2. 查询或创建会员
        Member member = getOrCreateMember(wechatResult.getOpenid(), wechatResult.getUnionid());

        // 3. 解密手机号（如有）
        if (dto.getEncryptedData() != null && dto.getIv() != null) {
            // 解密手机号逻辑...
        }

        // 4. 更新登录时间
        memberMapper.updateLoginTime(member.getCustomerId());

        // 5. 生成 Token
        String token = jwtUtils.generateToken(member.getCustomerId(), member.getOpenid());

        // 6. 构建返回数据
        LoginVO vo = new LoginVO();
        vo.setToken(token);
        vo.setTokenType("Bearer");
        vo.setExpiresIn(604800); // 7天
        vo.setCustomerId(member.getCustomerId());
        vo.setNickname(member.getNickname());
        vo.setAvatar(member.getAvatar());
        vo.setMobilePhone(member.getMobilePhone() != null ? member.getMobilePhone() : "");
        vo.setIsNewMember(false);

        return vo;
    }

    private Member getOrCreateMember(String openid, String unionid) {
        Member member = memberMapper.selectByOpenid(openid);

        if (member == null) {
            // 新会员注册
            member = new Member();
            member.setOpenid(openid);
            member.setUnionid(unionid);
            member.setNickname("微信用户");
            member.setAvatar("/static/images/mine/default.png");
            member.setMemberLevel(1);
            member.setPointNum(0);
            member.setCouponNum(0);
            member.setBalance(BigDecimal.ZERO);
            member.setGiftBalance(BigDecimal.ZERO);
            member.setCurrentValue(0);
            member.setMemberOrigin("wechat");
            member.setLastLoginTime(LocalDateTime.now());
            memberMapper.insert(member);
            log.info("新会员注册: openid={}, customerId={}", openid, member.getCustomerId());
        }

        return member;
    }

    @Override
    public MemberInfoVO getMemberInfo(Long memberId) {
        Member member = memberMapper.selectById(memberId);
        if (member == null) {
            throw new BusinessException(3001, "会员不存在");
        }

        MemberInfoVO vo = new MemberInfoVO();
        vo.setCustomerId(member.getCustomerId());
        vo.setNickname(member.getNickname());
        vo.setAvatar(member.getAvatar());
        vo.setMobilePhone(member.getMobilePhone());
        vo.setGender(member.getGender());
        vo.setCardNo(member.getCardNo());
        vo.setCardName(LEVEL_NAMES[member.getMemberLevel()]);
        vo.setMemberLevel(member.getMemberLevel());
        vo.setMemberLevelName("VIP" + member.getMemberLevel());
        vo.setPointNum(member.getPointNum());
        vo.setCouponNum(member.getCouponNum());
        vo.setBalance(member.getBalance());
        vo.setGiftBalance(member.getGiftBalance());
        vo.setCurrentValue(member.getCurrentValue());

        // 计算距下一级所需成长值
        int nextLevelValue = LEVEL_VALUES[member.getMemberLevel()];
        vo.setNeedValue(Math.max(0, nextLevelValue - member.getCurrentValue()));

        vo.setBirthday(member.getBirthday() != null ? member.getBirthday().toString() : null);
        vo.setMemberOrigin(member.getMemberOrigin());
        vo.setExpenseAmount(member.getExpenseAmount());
        vo.setLevel(member.getMemberLevel());

        return vo;
    }

    @Override
    @Transactional
    public void updateMemberInfo(Long memberId, String nickname, String avatar,
                                 Integer gender, String birthday) {
        Member member = new Member();
        member.setCustomerId(memberId);
        if (nickname != null) member.setNickname(nickname);
        if (avatar != null) member.setAvatar(avatar);
        if (gender != null) member.setGender(gender);
        if (birthday != null) member.setBirthday(LocalDateTime.parse(birthday));
        memberMapper.updateById(member);
    }
}
```

---

## 八、Controller 层 (REST API)

### 8.1 MemberController.java

```java
package com.naixue.controller;

import com.naixue.common.Result;
import com.naixue.dto.LoginDTO;
import com.naixue.service.MemberService;
import com.naixue.vo.LoginVO;
import com.naixue.vo.MemberInfoVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Api(tags = "会员接口")
@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @ApiOperation("微信授权登录")
    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody LoginDTO dto) {
        LoginVO vo = memberService.login(dto);
        return Result.success(vo);
    }

    @ApiOperation("获取会员信息")
    @GetMapping("/info")
    public Result<MemberInfoVO> getMemberInfo(@RequestAttribute Long memberId) {
        MemberInfoVO vo = memberService.getMemberInfo(memberId);
        return Result.success(vo);
    }

    @ApiOperation("更新会员信息")
    @PutMapping("/info")
    public Result<Void> updateMemberInfo(
            @RequestAttribute Long memberId,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String avatar,
            @RequestParam(required = false) Integer gender,
            @RequestParam(required = false) String birthday) {
        memberService.updateMemberInfo(memberId, nickname, avatar, gender, birthday);
        return Result.success();
    }
}
```

### 8.2 StoreController.java

```java
package com.naixue.controller;

import com.naixue.common.Result;
import com.naixue.entity.Store;
import com.naixue.service.StoreService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Api(tags = "门店接口")
@RestController
@RequestMapping("/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @ApiOperation("获取门店信息")
    @GetMapping
    public Result<Store> getStore(
            @RequestParam(required = false) String longitude,
            @RequestParam(required = false) String latitude) {
        Store store = storeService.getStore(longitude, latitude);
        return Result.success(store);
    }
}
```

---

## 九、工具类

### 9.1 Result.java (统一响应)

```java
package com.naixue.common;

import lombok.Data;
import java.io.Serializable;

@Data
public class Result<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer code;
    private String message;
    private T data;

    public static <T> Result<T> success() {
        return success(null);
    }

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.SUCCESS.getCode());
        result.setMessage(ResultCode.SUCCESS.getMessage());
        result.setData(data);
        return result;
    }

    public static <T> Result<T> error(String message) {
        return error(ResultCode.SYSTEM_ERROR.getCode(), message);
    }

    public static <T> Result<T> error(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}
```

### 9.2 ResultCode.java (响应码枚举)

```java
package com.naixue.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResultCode {
    SUCCESS(0, "success"),

    // 参数错误 1001-1999
    PARAM_ERROR(1001, "参数错误"),

    // 认证错误 2001-2999
    NOT_LOGIN(2001, "请先登录"),
    TOKEN_EXPIRED(2002, "登录已过期"),

    // 会员错误 3001-3999
    MEMBER_NOT_FOUND(3001, "会员不存在"),
    POINTS_NOT_ENOUGH(3002, "积分不足"),
    COUPON_NOT_AVAILABLE(3003, "优惠券不可用"),

    // 订单错误 4001-4999
    ORDER_NOT_FOUND(4001, "订单不存在"),
    ORDER_STATUS_ERROR(4002, "订单状态错误"),
    STOCK_NOT_ENOUGH(4003, "库存不足"),

    // 商品错误 5001-5999
    GOODS_NOT_FOUND(5001, "商品不存在"),
    GOODS_OFFLINE(5002, "商品已下架"),

    // 系统错误 9001-9999
    SYSTEM_ERROR(9001, "系统错误");

    private final Integer code;
    private final String message;
}
```

### 9.3 JwtUtils.java

```java
package com.naixue.utils;

import com.naixue.config.JwtConfig;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtils {

    private final JwtConfig jwtConfig;

    /**
     * 生成 Token
     */
    public String generateToken(Long memberId, String openid) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("memberId", memberId);
        claims.put("openid", openid);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtConfig.getExpiration() * 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 解析 Token
     */
    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            log.warn("Token 已过期");
            return null;
        } catch (JwtException e) {
            log.warn("无效 Token");
            return null;
        }
    }

    /**
     * 获取会员ID
     */
    public Long getMemberId(String token) {
        Claims claims = parseToken(token);
        return claims != null ? claims.get("memberId", Long.class) : null;
    }

    /**
     * 验证 Token
     */
    public boolean validateToken(String token) {
        return parseToken(token) != null;
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

### 9.4 WechatUtils.java

```java
package com.naixue.utils;

import cn.hutool.http.HttpUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class WechatUtils {

    @Value("${wechat.appid}")
    private String appid;

    @Value("${wechat.secret}")
    private String secret;

    private static final String CODE2SESSION_URL =
        "https://api.weixin.qq.com/sns/jscode2session";

    public WechatSessionResult code2Session(String code) {
        String url = CODE2SESSION_URL + "?appid=" + appid
                   + "&secret=" + secret
                   + "&js_code=" + code
                   + "&grant_type=authorization_code";

        try {
            String response = HttpUtil.get(url);
            JSONObject json = JSON.parseObject(response);

            Integer errcode = json.getInteger("errcode");
            if (errcode != null && errcode != 0) {
                throw new RuntimeException(json.getString("errmsg"));
            }

            return new WechatSessionResult(
                json.getString("openid"),
                json.getString("session_key"),
                json.getString("unionid")
            );
        } catch (Exception e) {
            log.error("微信 code2Session 失败", e);
            throw new RuntimeException("微信登录失败");
        }
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class WechatSessionResult {
        private String openid;
        private String sessionKey;
        private String unionid;
    }
}
```

---

## 十、拦截器和异常处理

### 10.1 JwtInterceptor.java

```java
package com.naixue.interceptor;

import com.naixue.common.Result;
import com.naixue.exception.BusinessException;
import com.naixue.utils.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request,
                            HttpServletResponse response,
                            Object handler) throws Exception {

        // OPTIONS 请求放行
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(response, 2001, "请先登录");
            return false;
        }

        String token = authHeader.substring(7);
        Long memberId = jwtUtils.getMemberId(token);

        if (memberId == null) {
            sendError(response, 2002, "登录已过期");
            return false;
        }

        // 将会员ID存入请求属性
        request.setAttribute("memberId", memberId);

        return true;
    }

    private void sendError(HttpServletResponse response, int code, String message) throws Exception {
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        Result<Void> result = Result.error(code, message);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
```

### 10.2 BusinessException.java

```java
package com.naixue.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final Integer code;

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
    }
}
```

### 10.3 GlobalExceptionHandler.java

```java
package com.naixue.exception;

import com.naixue.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.OK)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.error("业务异常: code={}, message={}", e.getCode(), e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error("系统错误");
    }
}
```

---

## 十一、数据库初始化脚本

```sql
-- 奈雪的茶小程序数据库初始化脚本
-- MySQL 8.0

CREATE DATABASE IF NOT EXISTS naixue DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE naixue;

-- 会员表
CREATE TABLE `member` (
  `customer_id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `openid` VARCHAR(100) COMMENT '微信OpenID',
  `unionid` VARCHAR(100) COMMENT '微信UnionID',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像',
  `mobile_phone` VARCHAR(20) COMMENT '手机号',
  `gender` TINYINT DEFAULT 0 COMMENT '性别: 0-女 1-男',
  `card_no` VARCHAR(50) COMMENT '会员卡号',
  `member_level` INT DEFAULT 1 COMMENT '会员等级: 1-6',
  `point_num` INT DEFAULT 0 COMMENT '积分',
  `balance` DECIMAL(10,2) DEFAULT 0 COMMENT '余额',
  `gift_balance` DECIMAL(10,2) DEFAULT 0 COMMENT '礼品卡余额',
  `current_value` INT DEFAULT 0 COMMENT '当前成长值',
  `member_origin` VARCHAR(20) DEFAULT 'wechat' COMMENT '来源',
  `last_login_time` DATETIME COMMENT '最后登录时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT DEFAULT 0,
  UNIQUE KEY `uk_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 门店表
CREATE TABLE `store` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '门店名称',
  `address` VARCHAR(255) NOT NULL COMMENT '地址',
  `mobile` VARCHAR(20) COMMENT '电话',
  `longitude` DECIMAL(10,6) COMMENT '经度',
  `latitude` DECIMAL(10,6) COMMENT '纬度',
  `area_name` VARCHAR(50) COMMENT '区域',
  `is_open` TINYINT(1) DEFAULT 1 COMMENT '是否营业',
  `is_takeout` TINYINT(1) DEFAULT 1 COMMENT '是否支持外卖',
  `min_price` DECIMAL(10,2) DEFAULT 0 COMMENT '起送价',
  `packing_fee` DECIMAL(10,2) DEFAULT 0 COMMENT '包装费',
  `delivery_cost` DECIMAL(10,2) DEFAULT 0 COMMENT '配送费',
  `is_show` TINYINT(1) DEFAULT 1 COMMENT '是否展示',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品分类表
CREATE TABLE `goods_category` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品表
CREATE TABLE `goods` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `category_id` BIGINT NOT NULL COMMENT '分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `content` TEXT COMMENT '描述',
  `images` VARCHAR(500) COMMENT '图片',
  `use_property` TINYINT(1) DEFAULT 0 COMMENT '是否有规格',
  `stock` DECIMAL(10,2) DEFAULT 0 COMMENT '库存',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表
CREATE TABLE `orders` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
  `member_id` BIGINT NOT NULL COMMENT '会员ID',
  `store_id` BIGINT NOT NULL COMMENT '门店ID',
  `type_cate` TINYINT NOT NULL COMMENT '1-自取 2-外卖',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0-待支付 1-已支付 2-制作中 3-已完成 4-已取消',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '总金额',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `goods_num` INT NOT NULL COMMENT '商品数量',
  `pay_mode` VARCHAR(20) COMMENT '支付方式',
  `payed_at` DATETIME COMMENT '支付时间',
  `sort_num` VARCHAR(10) COMMENT '取餐号',
  `postscript` VARCHAR(255) COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT DEFAULT 0,
  KEY `idx_member_id` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单商品表
CREATE TABLE `order_goods` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `goods_id` BIGINT NOT NULL COMMENT '商品ID',
  `goods_name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `number` INT NOT NULL COMMENT '数量',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '小计',
  `property` VARCHAR(255) COMMENT '规格',
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收货地址表
CREATE TABLE `address` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `member_id` BIGINT NOT NULL COMMENT '会员ID',
  `accept_name` VARCHAR(50) NOT NULL COMMENT '收货人',
  `mobile` VARCHAR(20) NOT NULL COMMENT '手机号',
  `province_name` VARCHAR(50) COMMENT '省份',
  `city_name` VARCHAR(50) COMMENT '城市',
  `area_name` VARCHAR(50) COMMENT '区域',
  `street` VARCHAR(255) COMMENT '详细地址',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `deleted` TINYINT DEFAULT 0,
  KEY `idx_member_id` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 优惠券表
CREATE TABLE `coupon` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL COMMENT '名称',
  `discount_amount` DECIMAL(10,2) COMMENT '优惠金额',
  `min_price` DECIMAL(10,2) DEFAULT 0 COMMENT '使用门槛',
  `status` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 会员优惠券表
CREATE TABLE `member_coupon` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `member_id` BIGINT NOT NULL COMMENT '会员ID',
  `coupon_id` BIGINT NOT NULL COMMENT '优惠券ID',
  `status` TINYINT(1) DEFAULT 0 COMMENT '0-未使用 1-已使用 2-已过期',
  `end_at` DATETIME NOT NULL COMMENT '过期时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_member_id` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 积分流水表
CREATE TABLE `points_flow` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `member_id` BIGINT NOT NULL COMMENT '会员ID',
  `change_type` TINYINT NOT NULL COMMENT '1-增加 2-减少',
  `change_num` INT NOT NULL COMMENT '变动数量',
  `reason` VARCHAR(100) COMMENT '原因',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_member_id` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 签到记录表
CREATE TABLE `attendance` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `member_id` BIGINT NOT NULL COMMENT '会员ID',
  `date` DATE NOT NULL COMMENT '签到日期',
  `attendance_point` INT DEFAULT 0 COMMENT '获得积分',
  `reward_days` INT DEFAULT 1 COMMENT '连续天数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_member_date` (`member_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 储值卡表
CREATE TABLE `recharge_card` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '名称',
  `value` DECIMAL(10,2) NOT NULL COMMENT '面值',
  `sell_price` DECIMAL(10,2) NOT NULL COMMENT '售价',
  `status` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 轮播图表
CREATE TABLE `banner` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(100) COMMENT '标题',
  `image` VARCHAR(255) NOT NULL COMMENT '图片',
  `link` VARCHAR(255) COMMENT '链接',
  `sort` INT DEFAULT 0,
  `status` TINYINT(1) DEFAULT 1,
  `position` VARCHAR(20) DEFAULT 'home',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化数据
INSERT INTO `store` (`name`, `address`, `mobile`, `longitude`, `latitude`, `is_open`, `is_takeout`, `min_price`, `packing_fee`, `delivery_cost`) VALUES
('卓悦中心ONE AVENUE店', '深圳市福田区海田路与福华一路交汇', '0755-82722513', '114.065927', '22.537361', 1, 1, 30.00, 2.00, 2.00);

INSERT INTO `recharge_card` (`name`, `value`, `sell_price`, `status`) VALUES
('30元', 30.00, 30.00, 1),
('50元', 50.00, 50.00, 1),
('100元', 100.00, 100.00, 1);
```

---

## 十二、项目启动

### 12.1 环境要求
- JDK 17+
- Maven 3.8+
- MySQL 8.0+

### 12.2 启动步骤

```bash
# 1. 克隆项目
git clone <project-url>
cd naixue-server

# 2. 修改配置
# 编辑 src/main/resources/application.yml
# 修改数据库连接、Redis、微信配置

# 3. 创建数据库
mysql -u root -p < sql/init.sql

# 4. 编译运行
mvn clean compile
mvn spring-boot:run

# 或打包后运行
mvn clean package -DskipTests
java -jar target/naixue-server-1.0.0.jar
```

### 12.3 API 访问
- 本地开发: `http://localhost:8080/api`
- 接口文档: `http://localhost:8080/api/swagger-ui.html`

---

## 十三、架构总结

### Spring Boot + SSM 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     前端 (微信小程序)                            │
│   WXML + WXSS + JS  →  JSON HTTP 请求                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                     Spring Boot 启动类                            │
│   @SpringBootApplication                                        │
│   @MapperScan("com.naixue.mapper")                             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    WebMvcConfig (Spring MVC)                      │
│   @RestController  →  @RequestMapping                          │
│   - JSON 消息转换 (Jackson)                                      │
│   - CORS 跨域配置                                               │
│   - JwtInterceptor 拦截器                                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Controller 层                              │
│   @RestController  →  返回 Result<T> (JSON)                      │
│   - 接收请求 @RequestBody / @RequestParam                       │
│   - 参数校验 @Valid                                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Service 层                                  │
│   @Service  +  @Transactional                                  │
│   - 业务逻辑处理                                                 │
│   - 事务管理                                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Mapper 层 (MyBatis)                         │
│   @Mapper  +  XML 映射文件                                       │
│   - @Select / @Insert / @Update / @Delete                      │
│   - 复杂查询 XML                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      MySQL 8.0 数据库                             │
└─────────────────────────────────────────────────────────────────┘
```

### 前后端分离通信

```
┌──────────────┐         HTTP + JSON         ┌──────────────┐
│   小程序前端   │ ◄─────────────────────────► │   后端 API    │
│   (View层)   │      @RestController        │  Controller   │
└──────────────┘                             └───────┬──────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │   Service    │
                                              │  (业务逻辑)   │
                                              └───────┬──────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │   Mapper     │
                                              │  (MyBatis)   │
                                              └───────┬──────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │    MySQL     │
                                              └──────────────┘
```

### RESTful API 设计

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /member/login | 微信登录 | 否 |
| GET | /member/info | 会员信息 | 是 |
| PUT | /member/info | 更新会员 | 是 |
| GET | /store | 门店信息 | 否 |
| GET | /goods | 商品列表 | 否 |
| POST | /order | 创建订单 | 是 |
| GET | /order/{id} | 订单详情 | 是 |
| PUT | /order/{id}/pay | 支付订单 | 是 |

### 分层职责

| 层 | 组件 | 职责 |
|----|------|------|
| **C** | @RestController | 接收请求、参数校验、返回 JSON |
| **S** | @Service | 业务逻辑、事务管理 |
| **M** | @Mapper + XML | 数据库 CRUD 操作 |
| **M** | Entity | 数据模型 |
